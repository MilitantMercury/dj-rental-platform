create policy "catalog_public_active_categories" on public.categories for select to anon, authenticated using (active = true);
create policy "catalog_public_active_products" on public.products for select to anon, authenticated using (active = true);
create policy "catalog_public_active_services" on public.services for select to anon, authenticated using (active = true);
create policy "catalog_public_product_images" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.active = true));
insert into storage.buckets (id, name, public) values ('catalog', 'catalog', true) on conflict (id) do update set public = excluded.public;
create policy "catalog_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'catalog');
create policy "catalog_owner_write" on storage.objects for all to authenticated using (bucket_id = 'catalog' and (select public.current_staff_role()) = 'owner') with check (bucket_id = 'catalog' and (select public.current_staff_role()) = 'owner');
