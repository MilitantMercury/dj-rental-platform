begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'notify1@example.test', '', now(), '{}', '{"first_name":"Notify","last_name":"One"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'notify2@example.test', '', now(), '{}', '{"first_name":"Notify","last_name":"Two"}', now(), now());

select public.notify_user('40000000-0000-0000-0000-000000000001', 'request_status_changed', 'Aggiornamento', 'La pratica è stata aggiornata.', '/area-riservata/richieste/abc', 'test:one');
select public.notify_user('40000000-0000-0000-0000-000000000002', 'request_status_changed', 'Aggiornamento', 'La pratica è stata aggiornata.', '/area-riservata/richieste/def', 'test:two');
select public.notify_user('40000000-0000-0000-0000-000000000001', 'request_status_changed', 'Duplicata', 'Non deve essere inserita.', '/area-riservata/richieste/abc', 'test:one');

select results_eq($$select count(*)::bigint from public.notifications$$, array[2::bigint], 'La chiave evento rende la creazione idempotente');

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000001', true);
select results_eq($$select count(*)::bigint from public.notifications$$, array[1::bigint], 'Il destinatario vede solo le proprie notifiche');
select results_eq($$select count(*)::bigint from public.notifications where event_key = 'test:two'$$, array[0::bigint], 'Le notifiche altrui non sono leggibili');
select lives_ok($$update public.notifications set read_at = now() where event_key = 'test:one'$$, 'Il destinatario può segnare come letta la propria notifica');
select results_eq($$select count(*)::bigint from public.notifications where event_key = 'test:one' and read_at is not null$$, array[1::bigint], 'La lettura viene registrata');
select lives_ok($$update public.notifications set read_at = null where event_key = 'test:one'$$, 'Il destinatario può segnare come non letta la propria notifica');
select results_eq($$select count(*)::bigint from public.notifications where event_key = 'test:one' and read_at is null$$, array[1::bigint], 'Lo stato non letto viene ripristinato');
select throws_ok($$update public.notifications set title = 'Alterata' where event_key = 'test:one'$$, '42501', null, 'Il destinatario non può alterare il contenuto');
select results_eq($$update public.notifications set read_at = now() where event_key = 'test:two' returning 1$$, array[]::integer[], 'Il destinatario non può aggiornare notifiche altrui');
select throws_ok($$insert into public.notifications (recipient_user_id, kind, title, body, href, event_key) values ('40000000-0000-0000-0000-000000000001', 'request_created', 'Falsa', 'Notifica non autorizzata.', '/area-riservata', 'fake')$$, '42501', null, 'Gli utenti non possono creare notifiche');

reset role;
select results_eq($$select count(*)::bigint from public.notifications where event_key = 'test:two' and read_at is null$$, array[1::bigint], 'La notifica altrui resta invariata');
select * from finish();
rollback;
