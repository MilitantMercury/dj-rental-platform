create type public.staff_role as enum ('collaborator', 'owner');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '', last_name text not null default '', phone text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint profiles_first_name_length check (char_length(first_name) <= 100),
  constraint profiles_last_name_length check (char_length(last_name) <= 100),
  constraint profiles_phone_length check (phone is null or char_length(phone) <= 30)
);

create table public.customer_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  company_name text, tax_code text, vat_number text, address text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete restrict,
  role public.staff_role not null, display_name text not null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint staff_profiles_display_name_length check (char_length(display_name) between 1 and 100)
);

create or replace function public.set_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger customer_profiles_set_updated_at before update on public.customer_profiles for each row execute function public.set_updated_at();
create trigger staff_profiles_set_updated_at before update on public.staff_profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, first_name, last_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'first_name', ''), 100), left(coalesce(new.raw_user_meta_data ->> 'last_name', ''), 100));
  insert into public.customer_profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.current_staff_role() returns public.staff_role
language sql stable security definer set search_path = '' as $$
  select role from public.staff_profiles where user_id = (select auth.uid()) and active = true
$$;

revoke all on function public.current_staff_role() from public;
grant execute on function public.current_staff_role() to authenticated;

alter table public.profiles enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.staff_profiles enable row level security;

create policy "profiles_select_own_or_owner" on public.profiles for select to authenticated
using ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner');
create policy "profiles_update_own_or_owner" on public.profiles for update to authenticated
using ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner')
with check ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner');

create policy "customer_profiles_select_own_or_owner" on public.customer_profiles for select to authenticated
using ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner');
create policy "customer_profiles_update_own_or_owner" on public.customer_profiles for update to authenticated
using ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner')
with check ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner');

create policy "staff_profiles_select_self_or_owner" on public.staff_profiles for select to authenticated
using ((select auth.uid()) = user_id or (select public.current_staff_role()) = 'owner');
create policy "staff_profiles_owner_all" on public.staff_profiles for all to authenticated
using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');

revoke all on table public.profiles, public.customer_profiles, public.staff_profiles from anon;
grant select, update on table public.profiles, public.customer_profiles to authenticated;
grant select, insert, update, delete on table public.staff_profiles to authenticated;

comment on table public.profiles is 'Dati identificativi comuni collegati a Supabase Auth.';
comment on table public.customer_profiles is 'Dati aggiuntivi visibili al cliente proprietario e agli owner.';
comment on table public.staff_profiles is 'Ruoli staff separati dai dati cliente e modificabili solo dagli owner.';
