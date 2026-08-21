create table public.app_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Europe/Rome' check (timezone = 'Europe/Rome'),
  option_duration_hours integer not null default 48 check (option_duration_hours between 1 and 720),
  operational_margin_days integer not null default 0 check (operational_margin_days between 0 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

create table public.inventory_stock (
  product_id uuid primary key references public.products(id) on delete restrict,
  total_quantity integer not null default 0 check (total_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_unavailability (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  start_date date,
  end_date date,
  reason text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_unavailability_dates check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

insert into public.inventory_stock (product_id)
select id from public.products
on conflict (product_id) do nothing;

create or replace function public.create_inventory_stock_for_product()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.inventory_stock (product_id) values (new.id)
  on conflict (product_id) do nothing;
  return new;
end;
$$;

create trigger products_create_inventory_stock
after insert on public.products
for each row execute function public.create_inventory_stock_for_product();

create trigger app_settings_set_updated_at before update on public.app_settings for each row execute function public.set_updated_at();
create trigger inventory_stock_set_updated_at before update on public.inventory_stock for each row execute function public.set_updated_at();
create trigger inventory_unavailability_set_updated_at before update on public.inventory_unavailability for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.inventory_stock enable row level security;
alter table public.inventory_unavailability enable row level security;

create policy "settings owner all" on public.app_settings for all to authenticated
using ((select public.current_staff_role()) = 'owner')
with check ((select public.current_staff_role()) = 'owner');

create policy "inventory stock owner all" on public.inventory_stock for all to authenticated
using ((select public.current_staff_role()) = 'owner')
with check ((select public.current_staff_role()) = 'owner');

create policy "inventory unavailability owner all" on public.inventory_unavailability for all to authenticated
using ((select public.current_staff_role()) = 'owner')
with check ((select public.current_staff_role()) = 'owner');

revoke all on table public.app_settings, public.inventory_stock, public.inventory_unavailability from anon;
grant select, insert, update, delete on table public.app_settings, public.inventory_stock, public.inventory_unavailability to authenticated;

alter table public.requests drop constraint requests_status;
alter table public.requests add constraint requests_status check (
  status in (
    'received',
    'in_review',
    'awaiting_services',
    'quote_draft',
    'quote_published',
    'option',
    'awaiting_deposit',
    'changes_requested',
    'accepted',
    'confirmed',
    'preparing',
    'delivered_or_collected',
    'returned',
    'closed',
    'rejected',
    'cancelled',
    'expired'
  )
);

create or replace function public.confirm_request_if_available(
  p_request_id uuid,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status text;
  target_start_date date;
  target_end_date date;
  margin_days integer;
  inventory_row record;
  stock_quantity integer;
  occupied_quantity integer;
  conflicts jsonb := '[]'::jsonb;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  select status, event_date, event_end_date
    into target_status, target_start_date, target_end_date
  from public.requests
  where id = p_request_id
  for update;

  if target_status is null then
    raise exception 'Pratica non trovata';
  end if;

  if target_status <> 'accepted' then
    return jsonb_build_object('confirmed', false, 'reason', 'stato_non_valido', 'conflicts', conflicts);
  end if;

  select operational_margin_days into margin_days from public.app_settings where id = true;
  margin_days := coalesce(margin_days, 0);

  for inventory_row in
    select item_id as product_id, sum(quantity)::integer as requested_quantity
    from public.request_items
    where request_id = p_request_id and item_type = 'product'
    group by item_id
    order by item_id
  loop
    select total_quantity into stock_quantity
    from public.inventory_stock
    where product_id = inventory_row.product_id
    for update;

    if stock_quantity is null then
      conflicts := conflicts || jsonb_build_array(jsonb_build_object(
        'product_id', inventory_row.product_id,
        'requested_quantity', inventory_row.requested_quantity,
        'available_quantity', 0,
        'reason', 'giacenza_non_configurata'
      ));
      continue;
    end if;

    select coalesce(max(coalesce(unavailable.quantity, 0) + coalesce(reserved.quantity, 0)), 0)
      into occupied_quantity
    from generate_series(
      (target_start_date - margin_days)::timestamp,
      (target_end_date + margin_days)::timestamp,
      interval '1 day'
    ) as scheduled(day)
    left join lateral (
      select sum(quantity)::integer as quantity
      from public.inventory_unavailability
      where product_id = inventory_row.product_id
        and (start_date is null or start_date <= scheduled.day::date)
        and (end_date is null or end_date >= scheduled.day::date)
    ) unavailable on true
    left join lateral (
      select sum(request_item.quantity)::integer as quantity
      from public.requests existing_request
      join public.request_items request_item on request_item.request_id = existing_request.id
      where existing_request.id <> p_request_id
        and existing_request.status in ('option', 'awaiting_deposit', 'confirmed', 'preparing', 'delivered_or_collected', 'returned')
        and request_item.item_type = 'product'
        and request_item.item_id = inventory_row.product_id
        and existing_request.event_date - margin_days <= scheduled.day::date
        and existing_request.event_end_date + margin_days >= scheduled.day::date
    ) reserved on true;

    if stock_quantity - occupied_quantity < inventory_row.requested_quantity then
      conflicts := conflicts || jsonb_build_array(jsonb_build_object(
        'product_id', inventory_row.product_id,
        'requested_quantity', inventory_row.requested_quantity,
        'available_quantity', greatest(stock_quantity - occupied_quantity, 0),
        'reason', 'quantita_insufficiente'
      ));
    end if;
  end loop;

  if jsonb_array_length(conflicts) > 0 then
    return jsonb_build_object('confirmed', false, 'reason', 'disponibilita_insufficiente', 'conflicts', conflicts);
  end if;

  update public.requests set status = 'confirmed' where id = p_request_id and status = 'accepted';

  insert into public.request_status_history (
    request_id, previous_status, new_status, changed_by, note
  ) values (
    p_request_id,
    'accepted',
    'confirmed',
    auth.uid(),
    coalesce(nullif(left(trim(p_note), 2000), ''), 'Pratica confermata definitivamente dall’owner dopo la verifica della disponibilità.')
  );

  return jsonb_build_object('confirmed', true, 'conflicts', '[]'::jsonb);
end;
$$;

grant execute on function public.confirm_request_if_available(uuid, text) to authenticated;

comment on table public.inventory_stock is 'Giacenza aggregata per prodotto, modificabile solo dall’owner.';
comment on table public.inventory_unavailability is 'Quantità fuori servizio, temporanee o indefinite, escluse dalla disponibilità.';
comment on function public.confirm_request_if_available(uuid, text) is 'Conferma atomicamente una pratica accettata solo se le quantità restano disponibili.';
