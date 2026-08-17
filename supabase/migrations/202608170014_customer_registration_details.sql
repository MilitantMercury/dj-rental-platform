alter table public.profiles
  add column email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.user_id
  and p.email is null;

alter table public.profiles
  add constraint profiles_email_length
  check (email is null or char_length(email) <= 320);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, first_name, last_name, email, phone)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'first_name', ''), 100),
    left(coalesce(new.raw_user_meta_data ->> 'last_name', ''), 100),
    new.email,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30), '')
  );

  insert into public.customer_profiles (
    user_id,
    company_name,
    tax_code,
    vat_number,
    address
  )
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'company_name', ''), 160), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'tax_code', ''), 32), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'vat_number', ''), 32), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'address', ''), 300), '')
  );

  return new;
end;
$$;
