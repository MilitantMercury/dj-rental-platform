begin;
create extension if not exists pgtap with schema extensions;
select plan(6);
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000001','authenticated','authenticated','settings-customer@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','90000000-0000-0000-0000-000000000002','authenticated','authenticated','settings-owner@example.test','',now(),'{}','{}',now(),now());
delete from public.customer_profiles where user_id='90000000-0000-0000-0000-000000000002';
insert into public.staff_profiles(user_id,role,display_name) values('90000000-0000-0000-0000-000000000002','owner','Settings Owner');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000001',true);
select results_eq('select count(*)::bigint from public.app_settings',array[0::bigint],'Il cliente non legge le impostazioni private');
select results_eq($$update public.app_settings set public_name='Vietato' returning 1$$,array[]::integer[],'Il cliente non modifica le impostazioni');
select is((select public_name from public.get_public_app_settings() limit 1),'Noleggio DJ','Il client legge solo la configurazione pubblica esposta');
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000002',true);
select lives_ok($$update public.app_settings set public_name='Noleggio Test', pickup_address='Via Roma 10, 20100 Milano (MI), Italia', pickup_address_street='Via Roma', pickup_address_number='10', pickup_address_postal_code='20100', pickup_address_city='Milano', pickup_address_province='MI', pickup_address_country='Italia' where id=true$$,'L owner modifica le impostazioni e l indirizzo strutturato');
select is((select pickup_address from public.get_public_app_settings() limit 1),'Via Roma 10, 20100 Milano (MI), Italia','Il client riceve solo l indirizzo di ritiro formattato');
select results_eq('select count(*)::bigint from public.audit_logs where entity_type=''app_settings'' and action=''app_settings_update''',array[1::bigint],'La modifica viene registrata in audit');
select * from finish();
rollback;
