begin;
select plan(7);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '21000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'feature-customer@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '21000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'feature-owner@example.test', '', now(), '{}', '{}', now(), now());
delete from public.customer_profiles where user_id = '21000000-0000-0000-0000-000000000002';
insert into public.staff_profiles (user_id, role, display_name) values ('21000000-0000-0000-0000-000000000002', 'owner', 'Feature Owner');

set local role authenticated;
select set_config('request.jwt.claim.sub', '21000000-0000-0000-0000-000000000001', true);
select throws_ok($$select public.set_catalog_home_feature('products', '31000000-0000-0000-0000-000000000001', true)$$, '42501', null, 'Il cliente non seleziona la copertina');

select set_config('request.jwt.claim.sub', '21000000-0000-0000-0000-000000000002', true);
insert into public.products (id, name, slug, description, specifications, included_accessories, active, published_at) values
  ('31000000-0000-0000-0000-000000000001', 'Console Uno', 'console-uno', '', '{}', '', true, now()),
  ('31000000-0000-0000-0000-000000000002', 'Console Due', 'console-due', '', '{}', '', true, now());
insert into public.product_images (product_id, storage_path, alt_text, sort_order) values
  ('31000000-0000-0000-0000-000000000001', 'products/31000000-0000-0000-0000-000000000001/33000000-0000-0000-0000-000000000001.webp', 'Uno', 0),
  ('31000000-0000-0000-0000-000000000002', 'products/31000000-0000-0000-0000-000000000002/33000000-0000-0000-0000-000000000002.webp', 'Due', 0);
insert into public.services (id, name, slug, description, conditions, active, published_at, image_path) values
  ('32000000-0000-0000-0000-000000000001', 'DJ Uno', 'dj-uno', '', '', true, now(), 'services/32000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000001.webp'),
  ('32000000-0000-0000-0000-000000000002', 'DJ Due', 'dj-due', '', '', true, now(), 'services/32000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000002.webp');

select lives_ok($$select public.set_catalog_home_feature('products', '31000000-0000-0000-0000-000000000001', true)$$, 'L owner seleziona un prodotto');
select lives_ok($$select public.set_catalog_home_feature('products', '31000000-0000-0000-0000-000000000002', true)$$, 'Un nuovo prodotto sostituisce il precedente');
select results_eq($$select id from public.products where featured_on_home$$, array['31000000-0000-0000-0000-000000000002'::uuid], 'Resta un solo prodotto in copertina');
select lives_ok($$select public.set_catalog_home_feature('services', '32000000-0000-0000-0000-000000000001', true)$$, 'L owner seleziona un servizio');
select lives_ok($$select public.set_catalog_home_feature('services', '32000000-0000-0000-0000-000000000002', true)$$, 'Un nuovo servizio sostituisce il precedente');
select results_eq($$select id from public.services where featured_on_home$$, array['32000000-0000-0000-0000-000000000002'::uuid], 'Resta un solo servizio in copertina');

select * from finish();
rollback;
