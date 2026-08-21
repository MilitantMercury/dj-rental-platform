create table public.request_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  staff_user_id uuid not null references public.profiles(user_id) on delete restrict,
  operational_role text not null default 'operator' check (operational_role in ('operator', 'lead')),
  assigned_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, staff_user_id)
);

create table public.preparation_lists (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete restrict,
  status text not null default 'open' check (status in ('open', 'completed')),
  started_at timestamptz not null default now(),
  started_by uuid not null references public.profiles(user_id) on delete restrict,
  completed_at timestamptz,
  completed_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.preparation_items (
  id uuid primary key default gen_random_uuid(),
  preparation_list_id uuid not null references public.preparation_lists(id) on delete restrict,
  source_request_item_id uuid not null unique references public.request_items(id) on delete restrict,
  description text not null,
  expected_quantity integer not null check (expected_quantity > 0),
  prepared_quantity integer not null default 0 check (prepared_quantity >= 0),
  delivered_quantity integer not null default 0 check (delivered_quantity >= 0),
  returned_quantity integer not null default 0 check (returned_quantity >= 0),
  status text not null default 'pending' check (status in ('pending', 'prepared', 'delivered', 'returned', 'issue')),
  notes text not null default '' check (char_length(notes) <= 2000),
  updated_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint preparation_items_prepared_limit check (prepared_quantity <= expected_quantity),
  constraint preparation_items_delivered_limit check (delivered_quantity <= expected_quantity),
  constraint preparation_items_returned_limit check (returned_quantity <= expected_quantity)
);

create trigger request_assignments_set_updated_at before update on public.request_assignments for each row execute function public.set_updated_at();
create trigger preparation_lists_set_updated_at before update on public.preparation_lists for each row execute function public.set_updated_at();
create trigger preparation_items_set_updated_at before update on public.preparation_items for each row execute function public.set_updated_at();

alter table public.request_assignments enable row level security;
alter table public.preparation_lists enable row level security;
alter table public.preparation_items enable row level security;

create policy "request assignments owner all" on public.request_assignments for all to authenticated
using (coalesce((select public.current_staff_role())::text, '') = 'owner')
with check (coalesce((select public.current_staff_role())::text, '') = 'owner');
create policy "request assignments staff own select" on public.request_assignments for select to authenticated
using (staff_user_id = (select auth.uid()));

create policy "requests assigned staff select" on public.requests for select to authenticated
using (exists (select 1 from public.request_assignments assignment where assignment.request_id = public.requests.id and assignment.staff_user_id = (select auth.uid())));

create policy "preparation lists staff operational" on public.preparation_lists for select to authenticated
using (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
);
create policy "preparation lists owner write" on public.preparation_lists for insert to authenticated
with check (coalesce((select public.current_staff_role())::text, '') = 'owner');
create policy "preparation lists assigned update" on public.preparation_lists for update to authenticated
using (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
)
with check (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
);

create policy "preparation items staff operational" on public.preparation_items for select to authenticated
using (exists (
  select 1 from public.preparation_lists list
  where list.id = preparation_list_id
    and (coalesce((select public.current_staff_role())::text, '') = 'owner'
      or exists (select 1 from public.request_assignments assignment where assignment.request_id = list.request_id and assignment.staff_user_id = (select auth.uid())))
));
create policy "preparation items staff update" on public.preparation_items for update to authenticated
using (exists (
  select 1 from public.preparation_lists list
  where list.id = preparation_list_id
    and (coalesce((select public.current_staff_role())::text, '') = 'owner'
      or exists (select 1 from public.request_assignments assignment where assignment.request_id = list.request_id and assignment.staff_user_id = (select auth.uid())))
))
with check (exists (
  select 1 from public.preparation_lists list
  where list.id = preparation_list_id
    and (coalesce((select public.current_staff_role())::text, '') = 'owner'
      or exists (select 1 from public.request_assignments assignment where assignment.request_id = list.request_id and assignment.staff_user_id = (select auth.uid())))
));

revoke all on table public.request_assignments, public.preparation_lists, public.preparation_items from anon;
grant select, insert, update, delete on table public.request_assignments, public.preparation_lists, public.preparation_items to authenticated;

create or replace function public.start_preparation_list(p_request_id uuid, p_note text default '')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  list_id uuid;
  previous_status text;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  select status into previous_status from public.requests where id = p_request_id for update;
  if previous_status <> 'confirmed' then
    raise exception 'La pratica deve essere confermata prima della preparazione';
  end if;

  insert into public.preparation_lists (request_id, started_by)
  values (p_request_id, auth.uid())
  on conflict (request_id) do update set updated_at = now()
  returning id into list_id;

  insert into public.preparation_items (preparation_list_id, source_request_item_id, description, expected_quantity, updated_by)
  select list_id, item.id, item.description, item.quantity, auth.uid()
  from public.request_items item
  where item.request_id = p_request_id and item.item_type = 'product'
  on conflict (source_request_item_id) do nothing;

  update public.requests set status = 'preparing' where id = p_request_id and status = 'confirmed';
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note)
  values (p_request_id, 'confirmed', 'preparing', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Checklist di preparazione avviata.'));
  return list_id;
end;
$$;

grant execute on function public.start_preparation_list(uuid, text) to authenticated;

comment on table public.preparation_lists is 'Checklist operativa interna di preparazione, consegna e rientro.';
comment on table public.preparation_items is 'Snapshot operativo del materiale da preparare, consegnare e restituire.';
