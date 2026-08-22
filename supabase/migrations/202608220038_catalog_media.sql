alter table public.categories
  add column image_alt text not null default '',
  add constraint categories_image_alt_length check (char_length(image_alt) <= 250);

alter table public.services
  add column image_path text,
  add column image_alt text not null default '',
  add constraint services_image_alt_length check (char_length(image_alt) <= 250);

alter table public.categories
  add constraint categories_image_path_scope check (image_path is null or image_path ~ '^categories/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$');

alter table public.services
  add constraint services_image_path_scope check (image_path is null or image_path ~ '^services/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$');

alter table public.product_images
  add constraint product_images_storage_path_scope check (storage_path ~ '^products/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$');

update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'catalog';

drop policy if exists "catalog_owner_write" on storage.objects;
create policy "catalog_owner_insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'catalog'
  and (select public.current_staff_role()) = 'owner'
  and name ~ '^(categories|products|services)/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$'
);
create policy "catalog_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'catalog' and (select public.current_staff_role()) = 'owner')
with check (
  bucket_id = 'catalog'
  and (select public.current_staff_role()) = 'owner'
  and name ~ '^(categories|products|services)/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$'
);
create policy "catalog_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'catalog' and (select public.current_staff_role()) = 'owner');

comment on column public.categories.image_alt is 'Testo alternativo dell’immagine pubblica della categoria.';
comment on column public.services.image_path is 'Percorso dell’immagine pubblica nel bucket catalog.';
comment on column public.services.image_alt is 'Testo alternativo dell’immagine pubblica del servizio.';
