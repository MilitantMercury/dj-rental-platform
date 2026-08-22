begin;
select plan(17);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '50000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'request-customer@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '50000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'request-unverified@example.test', '', null, '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '50000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'request-owner@example.test', '', now(), '{}', '{}', now(), now());
delete from public.customer_profiles where user_id = '50000000-0000-0000-0000-000000000003';
insert into public.staff_profiles (user_id, role, display_name) values ('50000000-0000-0000-0000-000000000003', 'owner', 'Request Owner');

insert into public.categories (id, name, slug, published_at) values ('51000000-0000-0000-0000-000000000001', 'Audio richieste', 'audio-richieste', now());
insert into public.products (id, category_id, name, slug, description, specifications, included_accessories, reference_price_cents, published_at)
values ('52000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'Console snapshot', 'console-snapshot', 'Descrizione storica', '{"canali": 4}', 'Cavi', 19900, now());
insert into public.services (id, category_id, name, slug, description, conditions, reference_price_cents, published_at)
values ('53000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'Tecnico snapshot', 'tecnico-snapshot', 'Supporto storico', 'Entro mezzanotte', 9900, now());
insert into public.carts (id, customer_user_id) values ('54000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001');

select ok(not has_function_privilege('anon', 'public.submit_quote_request(text,timestamptz,timestamptz,text,text,text,text,text,text,text,text,text,text,boolean)', 'EXECUTE'), 'Anon non può inviare richieste');
select ok(has_function_privilege('authenticated', 'public.submit_quote_request(text,timestamptz,timestamptz,text,text,text,text,text,text,text,text,text,text,boolean)', 'EXECUTE'), 'Authenticated può usare la funzione protetta');
select ok(not has_table_privilege('authenticated', 'public.requests', 'INSERT'), 'Il cliente non può bypassare la funzione inserendo la testata');

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000002', true);
select throws_ok($$select public.submit_quote_request('Matrimonio','2026-09-01 16:00+00','2026-09-02 01:00+00','Villa','Via Roma','1','20100','Milano','MI','Italia','owner','customer','',true)$$, '42501', 'email_not_verified', 'Email non verificata rifiutata');
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000003', true);
select throws_ok($$select public.submit_quote_request('Matrimonio','2026-09-01 16:00+00','2026-09-02 01:00+00','Villa','Via Roma','1','20100','Milano','MI','Italia','owner','customer','',true)$$, '42501', 'not_authorized', 'Owner non può creare una richiesta cliente');
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000001', true);
select throws_ok($$select public.submit_quote_request('Matrimonio','2026-09-01 16:00+00','2026-09-02 01:00+00','Villa','Via Roma','1','20100','Milano','MI','Italia','owner','customer','',true)$$, '22023', 'empty_cart', 'Carrello vuoto rifiutato');

reset role;
insert into public.cart_items (cart_id, item_type, product_id, quantity) values ('54000000-0000-0000-0000-000000000001', 'product', '52000000-0000-0000-0000-000000000001', 2);
insert into public.cart_items (cart_id, item_type, service_id, quantity) values ('54000000-0000-0000-0000-000000000001', 'service', '53000000-0000-0000-0000-000000000001', 1);
set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000001', true);
select lives_ok($$select public.submit_quote_request('Matrimonio','2026-09-01 16:00+00','2026-09-02 01:00+00','Villa Aurora','Via Roma','1','20100','Milano','MI','Italia','owner','customer','Note cliente',true)$$, 'La richiesta completa viene inviata');
select results_eq($$select count(*)::bigint from public.requests where customer_user_id = '50000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'La testata è visibile al cliente');
select results_eq($$select count(*)::bigint from public.request_items$$, array[2::bigint], 'Prodotto e servizio sono copiati');
select results_eq($$select count(*)::bigint from public.request_items where catalog_snapshot->>'name' in ('Console snapshot','Tecnico snapshot')$$, array[2::bigint], 'Gli snapshot conservano i nomi');
select results_eq($$select count(*)::bigint from public.request_items where catalog_snapshot ? 'reference_price_cents'$$, array[0::bigint], 'Gli snapshot non espongono prezzi');
select results_eq($$select count(*)::bigint from public.cart_items$$, array[0::bigint], 'Il carrello viene svuotato');

reset role;
select results_eq($$select count(*)::bigint from public.audit_logs where action = 'request_submitted' and actor_id = '50000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'L invio produce audit');
select results_eq($$select count(*)::bigint from public.notifications where recipient_user_id = '50000000-0000-0000-0000-000000000003' and kind = 'request_created'$$, array[1::bigint], 'L owner riceve la notifica');

insert into public.cart_items (cart_id, item_type, product_id, quantity) values ('54000000-0000-0000-0000-000000000001', 'product', '52000000-0000-0000-0000-000000000001', 1);
update public.products set published_at = null where id = '52000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000001', true);
select throws_ok($$select public.submit_quote_request('Festa','2026-10-01 16:00+00','2026-10-02 01:00+00','Villa Aurora','Via Roma','1','20100','Milano','MI','Italia','owner','customer','',true)$$, 'P0001', 'catalog_changed', 'Una voce ritirata annulla l invio');
reset role;
select results_eq($$select count(*)::bigint from public.requests where customer_user_id = '50000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'Il fallimento non lascia una testata parziale');
select results_eq($$select count(*)::bigint from public.cart_items where cart_id = '54000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'Il fallimento conserva il carrello');

select * from finish();
rollback;
