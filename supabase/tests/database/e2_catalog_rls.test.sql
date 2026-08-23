begin;
select plan(17);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'catalog-customer@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'catalog-owner@example.test', '', now(), '{}', '{}', now(), now());
delete from public.customer_profiles where user_id = '20000000-0000-0000-0000-000000000002';
insert into public.staff_profiles (user_id, role, display_name) values ('20000000-0000-0000-0000-000000000002', 'owner', 'Catalog Owner');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.categories', array[0::bigint], 'Il cliente non legge il catalogo amministrativo');
select throws_ok($$insert into public.categories (name, slug) values ('Non autorizzata', 'non-autorizzata')$$, '42501', null, 'Il cliente non scrive il catalogo');
select throws_ok($$select public.move_catalog_item('categories', '30000000-0000-0000-0000-000000000001', -1)$$, '42501', null, 'Il cliente non riordina il catalogo');
select throws_ok($$select public.reorder_product_images('30000000-0000-0000-0000-000000000001', array[]::uuid[])$$, '42501', null, 'Il cliente non riordina la galleria');
select throws_ok($$insert into storage.objects (bucket_id, name) values ('catalog', 'products/20000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001.webp')$$, '42501', null, 'Il cliente non carica immagini catalogo');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select lives_ok($$insert into public.categories (name, slug) values ('Audio', 'audio')$$, 'L owner crea una categoria');
select lives_ok($$insert into public.products (name, slug, description, specifications, included_accessories, active) values ('Console test', 'console-test', '', '{}', '', true)$$, 'L owner crea un prodotto');
select lives_ok($$insert into public.services (name, slug, description, conditions, active) values ('DJ test', 'dj-test', '', '', true)$$, 'L owner crea un servizio');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.categories', array[0::bigint], 'Il cliente non vede le bozze del catalogo');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select lives_ok($$update public.categories set published_at = now() where slug = 'audio'$$, 'L owner pubblica una categoria');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.categories', array[1::bigint], 'Il cliente vede la categoria pubblicata');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select lives_ok($$insert into storage.objects (bucket_id, name) values ('catalog', 'products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.webp')$$, 'L owner carica immagini in un percorso catalogo valido');
select lives_ok($$update public.categories set image_path = 'categories/' || id || '/30000000-0000-0000-0000-000000000003.webp', image_alt = 'Impianto audio' where slug = 'audio'$$, 'L aggiornamento immagine categoria produce audit');
select lives_ok($$insert into public.product_images (product_id, storage_path, alt_text, sort_order) select id, 'products/' || id || '/30000000-0000-0000-0000-000000000004.webp', 'Console frontale', 10 from public.products where slug = 'console-test'$$, 'L owner associa una immagine al prodotto');
select results_eq($$select count(*)::bigint from public.audit_logs where entity_type = 'product_images' and action = 'catalog_media_insert'$$, array[1::bigint], 'L associazione immagine prodotto produce audit');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*)::bigint from public.audit_logs', array[0::bigint], 'Il cliente non consulta gli audit media');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select results_eq($$select count(*)::bigint from public.audit_logs where entity_type = 'categories' and action = 'catalog_media_update'$$, array[1::bigint], 'L owner consulta l audit immagine categoria');

select * from finish();
rollback;
