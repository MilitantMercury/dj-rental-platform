create unique index customer_profiles_unique_tax_code
on public.customer_profiles (upper(tax_code))
where customer_type = 'private' and tax_code is not null;

create unique index customer_profiles_unique_vat_number
on public.customer_profiles (vat_number)
where customer_type = 'business' and vat_number is not null;
