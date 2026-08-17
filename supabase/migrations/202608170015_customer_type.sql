alter table public.customer_profiles
  add column customer_type text not null default 'private',
  add constraint customer_profiles_type
  check (customer_type in ('private', 'business'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'customer_type', 'private');
begin
  if account_type not in ('private', 'business') then
    account_type := 'private';
  end if;

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
    customer_type,
    company_name,
    tax_code,
    vat_number,
    address
  )
  values (
    new.id,
    account_type,
    case when account_type = 'business'
      then nullif(left(coalesce(new.raw_user_meta_data ->> 'company_name', ''), 160), '')
      else null
    end,
    case when account_type = 'private'
      then nullif(left(coalesce(new.raw_user_meta_data ->> 'tax_code', ''), 32), '')
      else null
    end,
    case when account_type = 'business'
      then nullif(left(coalesce(new.raw_user_meta_data ->> 'vat_number', ''), 32), '')
      else null
    end,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'address', ''), 300), '')
  );

  return new;
end;
$$;
