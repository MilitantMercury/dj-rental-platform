create table public.event_types (id uuid primary key default gen_random_uuid(), name text not null unique, description text not null default '', sort_order integer not null default 0, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), constraint event_types_name_length check (char_length(name) between 1 and 100));
create trigger event_types_set_updated_at before update on public.event_types for each row execute function public.set_updated_at();
alter table public.event_types enable row level security;
create policy "event types public active" on public.event_types for select to anon, authenticated using (active = true);
create policy "event types owner" on public.event_types for all to authenticated using ((select public.current_staff_role())='owner') with check ((select public.current_staff_role())='owner');
grant select on public.event_types to anon, authenticated; grant insert, update, delete on public.event_types to authenticated;
