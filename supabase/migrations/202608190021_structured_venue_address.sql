alter table public.requests
  add column venue_street text,
  add column venue_number text,
  add column venue_postal_code text,
  add column venue_city text,
  add column venue_province text,
  add column venue_country text not null default 'Italia',
  add constraint requests_venue_street_length check (venue_street is null or char_length(venue_street) between 1 and 160),
  add constraint requests_venue_number_length check (venue_number is null or char_length(venue_number) between 1 and 20),
  add constraint requests_venue_postal_code_format check (venue_postal_code is null or venue_postal_code ~ '^[0-9]{5}$'),
  add constraint requests_venue_city_length check (venue_city is null or char_length(venue_city) between 1 and 100),
  add constraint requests_venue_province_format check (venue_province is null or venue_province ~ '^[A-Z]{2}$'),
  add constraint requests_venue_country_length check (char_length(venue_country) between 2 and 100);
