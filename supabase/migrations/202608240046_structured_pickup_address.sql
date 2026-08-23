alter table public.app_settings
  add column pickup_address_street text not null default '',
  add column pickup_address_number text not null default '',
  add column pickup_address_postal_code text not null default '',
  add column pickup_address_city text not null default '',
  add column pickup_address_province text not null default '',
  add column pickup_address_country text not null default 'Italia',
  add constraint app_settings_pickup_street_length check (char_length(pickup_address_street) <= 160),
  add constraint app_settings_pickup_number_length check (char_length(pickup_address_number) <= 20),
  add constraint app_settings_pickup_postal_code_format check (pickup_address_postal_code = '' or pickup_address_postal_code ~ '^[0-9]{5}$'),
  add constraint app_settings_pickup_city_length check (char_length(pickup_address_city) <= 100),
  add constraint app_settings_pickup_province_format check (pickup_address_province = '' or pickup_address_province ~ '^[A-Z]{2}$'),
  add constraint app_settings_pickup_country_length check (char_length(pickup_address_country) between 2 and 100);

-- Preserve legacy free-text addresses for manual refinement in the new fields.
update public.app_settings
set pickup_address_street = pickup_address
where pickup_address <> '' and pickup_address_street = '';

comment on column public.app_settings.pickup_address is 'Indirizzo di ritiro formattato per le viste pubbliche.';
comment on column public.app_settings.pickup_address_street is 'Via o piazza del punto di ritiro.';
comment on column public.app_settings.pickup_address_number is 'Numero civico del punto di ritiro.';
comment on column public.app_settings.pickup_address_postal_code is 'CAP del punto di ritiro.';
comment on column public.app_settings.pickup_address_city is 'Comune del punto di ritiro.';
comment on column public.app_settings.pickup_address_province is 'Sigla provincia del punto di ritiro.';
comment on column public.app_settings.pickup_address_country is 'Nazione del punto di ritiro.';
