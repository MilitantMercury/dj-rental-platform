begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'cliente1@example.test', '', now(), '{}', '{"first_name":"Cliente","last_name":"Uno"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'cliente2@example.test', '', now(), '{}', '{"first_name":"Cliente","last_name":"Due"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'owner@example.test', '', now(), '{}', '{"first_name":"Owner","last_name":"Test"}', now(), now());

delete from public.customer_profiles where user_id = '10000000-0000-0000-0000-000000000003';
insert into public.staff_profiles (user_id, role, display_name) values ('10000000-0000-0000-0000-000000000003', 'owner', 'Owner Test');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.profiles', array[1::bigint], 'Il cliente legge solo il proprio profilo');
select results_eq('select count(*)::bigint from public.customer_profiles', array[1::bigint], 'Il cliente legge solo i propri dati cliente');
select results_eq('select count(*)::bigint from public.staff_profiles', array[0::bigint], 'Il cliente non legge profili staff');
select lives_ok($$update public.profiles set phone = '+390000000001' where user_id = '10000000-0000-0000-0000-000000000001'$$, 'Il cliente modifica il proprio profilo');
select results_eq($$update public.profiles set phone = '+390000000002' where user_id = '10000000-0000-0000-0000-000000000002' returning 1$$, array[]::integer[], 'Il cliente non modifica altri profili');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select results_eq('select count(*)::bigint from public.profiles', array[3::bigint], 'L owner legge tutti i profili');
select results_eq('select count(*)::bigint from public.customer_profiles', array[2::bigint], 'L owner legge tutti i clienti');
select results_eq('select count(*)::bigint from public.staff_profiles', array[1::bigint], 'L owner legge i profili staff');

select * from finish();
rollback;
