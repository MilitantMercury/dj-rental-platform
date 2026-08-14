begin;
select plan(6);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'catalog-customer@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'catalog-owner@example.test', '', now(), '{}', '{}', now(), now());
delete from public.customer_profiles where user_id = '20000000-0000-0000-0000-000000000002';
insert into public.staff_profiles (user_id, role, display_name) values ('20000000-0000-0000-0000-000000000002', 'owner', 'Catalog Owner');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.categories', array[0::bigint], 'Il cliente non legge il catalogo amministrativo');
select results_eq($$insert into public.categories (name, slug) values ('Non autorizzata', 'non-autorizzata') returning 1$$, array[]::integer[], 'Il cliente non scrive il catalogo');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select lives_ok($$insert into public.categories (name, slug) values ('Audio', 'audio')$$, 'L owner crea una categoria');
select lives_ok($$insert into public.products (name, slug, description, specifications, included_accessories, active) values ('Console test', 'console-test', '', '{}', '', true)$$, 'L owner crea un prodotto');
select lives_ok($$insert into public.services (name, slug, description, conditions, active) values ('DJ test', 'dj-test', '', '', true)$$, 'L owner crea un servizio');

select * from finish();
rollback;
