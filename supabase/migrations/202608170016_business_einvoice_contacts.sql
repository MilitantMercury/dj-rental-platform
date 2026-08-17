alter table public.customer_profiles
  add column pec text,
  add column recipient_code text,
  add constraint customer_profiles_pec_length
    check (pec is null or char_length(pec) <= 320),
  add constraint customer_profiles_recipient_code_length
    check (recipient_code is null or char_length(recipient_code) <= 16);

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
    case when account_type = 'private'
      then left(coalesce(new.raw_user_meta_data ->> 'first_name', ''), 100)
      else ''
    end,
    case when account_type = 'private'
      then left(coalesce(new.raw_user_meta_data ->> 'last_name', ''), 100)
      else ''
    end,
    new.email,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30), '')
  );

  insert into public.customer_profiles (
    user_id,
    customer_type,
    company_name,
    tax_code,
    vat_number,
    address,
    pec,
    recipient_code
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
    nullif(left(coalesce(new.raw_user_meta_data ->> 'address', ''), 300), ''),
    case when account_type = 'business'
      then nullif(left(coalesce(new.raw_user_meta_data ->> 'pec', ''), 320), '')
      else null
    end,
    case when account_type = 'business'
      then nullif(upper(left(coalesce(new.raw_user_meta_data ->> 'recipient_code', ''), 16)), '')
      else null
    end
  );

  return new;
end;
$$;
