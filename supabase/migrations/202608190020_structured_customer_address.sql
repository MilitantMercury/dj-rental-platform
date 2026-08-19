alter table public.customer_profiles
  add column address_street text,
  add column address_number text,
  add column address_postal_code text,
  add column address_city text,
  add column address_province text,
  add column address_country text not null default 'Italia',
  add constraint customer_profiles_address_street_length check (address_street is null or char_length(address_street) <= 160),
  add constraint customer_profiles_address_number_length check (address_number is null or char_length(address_number) <= 20),
  add constraint customer_profiles_address_postal_code_format check (address_postal_code is null or address_postal_code ~ '^[0-9]{5}$'),
  add constraint customer_profiles_address_city_length check (address_city is null or char_length(address_city) <= 100),
  add constraint customer_profiles_address_province_format check (address_province is null or address_province ~ '^[A-Z]{2}$'),
  add constraint customer_profiles_address_country_length check (char_length(address_country) between 2 and 100);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'customer_type', 'private');
begin
  if account_type not in ('private', 'business') then account_type := 'private'; end if;
  insert into public.profiles (user_id, first_name, last_name, email, phone)
  values (new.id, case when account_type = 'private' then left(coalesce(new.raw_user_meta_data ->> 'first_name', ''), 100) else '' end, case when account_type = 'private' then left(coalesce(new.raw_user_meta_data ->> 'last_name', ''), 100) else '' end, new.email, nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30), ''));
  insert into public.customer_profiles (user_id, customer_type, company_name, tax_code, vat_number, address, pec, recipient_code, address_street, address_number, address_postal_code, address_city, address_province, address_country)
  values (new.id, account_type, case when account_type = 'business' then nullif(left(coalesce(new.raw_user_meta_data ->> 'company_name', ''), 160), '') else null end, case when account_type = 'private' then nullif(left(coalesce(new.raw_user_meta_data ->> 'tax_code', ''), 32), '') else null end, case when account_type = 'business' then nullif(left(coalesce(new.raw_user_meta_data ->> 'vat_number', ''), 32), '') else null end, nullif(left(coalesce(new.raw_user_meta_data ->> 'address', ''), 300), ''), case when account_type = 'business' then nullif(left(coalesce(new.raw_user_meta_data ->> 'pec', ''), 320), '') else null end, case when account_type = 'business' then nullif(upper(left(coalesce(new.raw_user_meta_data ->> 'recipient_code', ''), 16)), '') else null end, nullif(left(coalesce(new.raw_user_meta_data ->> 'address_street', ''), 160), ''), nullif(left(coalesce(new.raw_user_meta_data ->> 'address_number', ''), 20), ''), nullif(left(coalesce(new.raw_user_meta_data ->> 'address_postal_code', ''), 5), ''), nullif(left(coalesce(new.raw_user_meta_data ->> 'address_city', ''), 100), ''), nullif(upper(left(coalesce(new.raw_user_meta_data ->> 'address_province', ''), 2)), ''), coalesce(nullif(left(coalesce(new.raw_user_meta_data ->> 'address_country', ''), 100), ''), 'Italia'));
  return new;
end;
$$;
