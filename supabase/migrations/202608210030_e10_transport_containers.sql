create table public.transport_containers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  container_type text not null check (container_type in ('flight_case', 'cassa', 'borsa', 'altro')),
  description text not null default '' check (char_length(description) <= 240),
  quantity integer not null check (quantity > 0),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  updated_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger transport_containers_set_updated_at before update on public.transport_containers for each row execute function public.set_updated_at();
alter table public.transport_containers enable row level security;

create policy "transport containers operational select" on public.transport_containers for select to authenticated
using (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
);
create policy "transport containers operational insert" on public.transport_containers for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (coalesce((select public.current_staff_role())::text, '') = 'owner'
    or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid())))
);
create policy "transport containers operational update" on public.transport_containers for update to authenticated
using (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
)
with check (
  coalesce((select public.current_staff_role())::text, '') = 'owner'
  or exists (select 1 from public.request_assignments assignment where assignment.request_id = request_id and assignment.staff_user_id = (select auth.uid()))
);

revoke all on table public.transport_containers from anon;
grant select, insert, update on table public.transport_containers to authenticated;
comment on table public.transport_containers is 'Contenitori associati alla pratica per le operazioni di trasporto; non rappresentano inventario serializzato.';
