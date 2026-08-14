create table public.requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique default ('R-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_user_id uuid not null references public.profiles(user_id) on delete restrict,
  status text not null default 'received',
  event_type text not null,
  event_date date not null,
  event_end_date date not null,
  venue_name text not null,
  venue_address text not null,
  logistics_mode text not null,
  customer_notes text not null default '',
  privacy_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_status check (status in ('received','in_review','rejected','cancelled')),
  constraint requests_dates check (event_end_date >= event_date),
  constraint requests_logistics check (logistics_mode in ('pickup','delivery')),
  constraint requests_text check (char_length(event_type) between 1 and 100 and char_length(venue_name) between 1 and 160 and char_length(venue_address) between 1 and 300 and char_length(customer_notes) <= 2000)
);
create trigger requests_set_updated_at before update on public.requests for each row execute function public.set_updated_at();
alter table public.requests enable row level security;
create policy "requests_customer_select_own" on public.requests for select to authenticated using ((select auth.uid()) = customer_user_id or (select public.current_staff_role()) = 'owner');
create policy "requests_customer_insert_own" on public.requests for insert to authenticated with check ((select auth.uid()) = customer_user_id and (select public.current_staff_role()) is null);
create policy "requests_owner_all" on public.requests for all to authenticated using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');
revoke all on table public.requests from anon, authenticated;
grant select, insert on public.requests to authenticated;
grant update, delete on public.requests to authenticated;
