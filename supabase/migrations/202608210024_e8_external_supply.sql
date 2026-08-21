create table public.external_supplies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  supplier_name text not null,
  quantity integer not null check (quantity > 0),
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled')),
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_supplies_supplier_name_length check (char_length(supplier_name) between 1 and 160),
  constraint external_supplies_notes_length check (char_length(internal_notes) <= 2000)
);

create index external_supplies_request_product_idx on public.external_supplies (request_id, product_id);
create trigger external_supplies_set_updated_at before update on public.external_supplies for each row execute function public.set_updated_at();

alter table public.external_supplies enable row level security;
create policy "external supplies owner all" on public.external_supplies for all to authenticated
using ((select public.current_staff_role()) = 'owner')
with check ((select public.current_staff_role()) = 'owner');
revoke all on table public.external_supplies from anon;
grant select, insert, update, delete on table public.external_supplies to authenticated;

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
  external_quantity integer;
  internal_quantity integer;
  conflicts jsonb := '[]'::jsonb;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then raise exception 'Permesso negato'; end if;
  select status, event_date, event_end_date into target_status, target_start_date, target_end_date from public.requests where id = p_request_id for update;
  if target_status is null then raise exception 'Pratica non trovata'; end if;
  if target_status <> 'accepted' then return jsonb_build_object('confirmed', false, 'reason', 'stato_non_valido', 'conflicts', conflicts); end if;
  select operational_margin_days into margin_days from public.app_settings where id = true;
  margin_days := coalesce(margin_days, 0);
  for inventory_row in select item_id as product_id, sum(quantity)::integer as requested_quantity from public.request_items where request_id = p_request_id and item_type = 'product' group by item_id order by item_id loop
    select coalesce(sum(quantity), 0)::integer into external_quantity from public.external_supplies where request_id = p_request_id and product_id = inventory_row.product_id and status = 'confirmed';
    internal_quantity := greatest(inventory_row.requested_quantity - external_quantity, 0);
    if internal_quantity = 0 then continue; end if;
    select total_quantity into stock_quantity from public.inventory_stock where product_id = inventory_row.product_id for update;
    if stock_quantity is null then conflicts := conflicts || jsonb_build_array(jsonb_build_object('product_id', inventory_row.product_id, 'requested_quantity', internal_quantity, 'available_quantity', 0, 'reason', 'giacenza_non_configurata')); continue; end if;
    select coalesce(max(coalesce(unavailable.quantity, 0) + coalesce(reserved.quantity, 0)), 0) into occupied_quantity from generate_series((target_start_date - margin_days)::timestamp, (target_end_date + margin_days)::timestamp, interval '1 day') as scheduled(day)
    left join lateral (select sum(quantity)::integer as quantity from public.inventory_unavailability where product_id = inventory_row.product_id and (start_date is null or start_date <= scheduled.day::date) and (end_date is null or end_date >= scheduled.day::date)) unavailable on true
    left join lateral (select sum(request_item.quantity)::integer as quantity from public.requests existing_request join public.request_items request_item on request_item.request_id = existing_request.id where existing_request.id <> p_request_id and existing_request.status in ('option', 'awaiting_deposit', 'confirmed', 'preparing', 'delivered_or_collected', 'returned') and request_item.item_type = 'product' and request_item.item_id = inventory_row.product_id and existing_request.event_date - margin_days <= scheduled.day::date and existing_request.event_end_date + margin_days >= scheduled.day::date) reserved on true;
    if stock_quantity - occupied_quantity < internal_quantity then conflicts := conflicts || jsonb_build_array(jsonb_build_object('product_id', inventory_row.product_id, 'requested_quantity', internal_quantity, 'available_quantity', greatest(stock_quantity - occupied_quantity, 0), 'reason', 'quantita_insufficiente')); end if;
  end loop;
  if jsonb_array_length(conflicts) > 0 then return jsonb_build_object('confirmed', false, 'reason', 'disponibilita_insufficiente', 'conflicts', conflicts); end if;
  update public.requests set status = 'confirmed' where id = p_request_id and status = 'accepted';
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note) values (p_request_id, 'accepted', 'confirmed', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Pratica confermata definitivamente dall’owner dopo la verifica della disponibilità.'));
  return jsonb_build_object('confirmed', true, 'conflicts', '[]'::jsonb);
end;
$$;

comment on table public.external_supplies is 'Coperture da fornitori terzi, interne e visibili solo all’owner.';
