alter table public.categories add column published_at timestamptz;
alter table public.products add column published_at timestamptz, add column sort_order integer not null default 0;
alter table public.services add column published_at timestamptz, add column sort_order integer not null default 0;

update public.categories set published_at = created_at where active = true;
update public.products set published_at = created_at where active = true;
update public.services set published_at = created_at where active = true;

with ranked as (select id, row_number() over (order by sort_order, created_at, id) * 10 as position from public.categories)
update public.categories c set sort_order = ranked.position from ranked where c.id = ranked.id;
with ranked as (select id, row_number() over (order by created_at, id) * 10 as position from public.products)
update public.products p set sort_order = ranked.position from ranked where p.id = ranked.id;
with ranked as (select id, row_number() over (order by created_at, id) * 10 as position from public.services)
update public.services s set sort_order = ranked.position from ranked where s.id = ranked.id;
with ranked as (select id, row_number() over (partition by product_id order by sort_order, created_at, id) * 10 as position from public.product_images)
update public.product_images pi set sort_order = ranked.position from ranked where pi.id = ranked.id;

drop policy "catalog_public_active_categories" on public.categories;
drop policy "catalog_public_active_products" on public.products;
drop policy "catalog_public_active_services" on public.services;
drop policy "catalog_public_product_images" on public.product_images;

create policy "catalog_public_published_categories" on public.categories for select to anon, authenticated
using (active = true and published_at is not null);
create policy "catalog_public_published_products" on public.products for select to anon, authenticated
using (active = true and published_at is not null);
create policy "catalog_public_published_services" on public.services for select to anon, authenticated
using (active = true and published_at is not null);
create policy "catalog_public_published_product_images" on public.product_images for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_id and p.active = true and p.published_at is not null
));

create or replace function public.move_catalog_item(
  target_type text,
  target_id uuid,
  direction integer
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_order integer;
  neighbor_id uuid;
  neighbor_order integer;
  product_scope uuid;
begin
  if (select public.current_staff_role()) is distinct from 'owner' then
    raise exception 'Operazione non autorizzata' using errcode = '42501';
  end if;
  if direction not in (-1, 1) or target_type not in ('categories', 'products', 'services', 'product_images') then
    raise exception 'Ordinamento non valido' using errcode = '22023';
  end if;

  if target_type = 'product_images' then
    select sort_order, product_id into current_order, product_scope
    from public.product_images where id = target_id for update;
    if direction = -1 then
      select id, sort_order into neighbor_id, neighbor_order from public.product_images
      where product_id = product_scope and (sort_order, id) < (current_order, target_id)
      order by sort_order desc, id desc limit 1 for update;
    else
      select id, sort_order into neighbor_id, neighbor_order from public.product_images
      where product_id = product_scope and (sort_order, id) > (current_order, target_id)
      order by sort_order, id limit 1 for update;
    end if;
  else
    execute format('select sort_order from public.%I where id = $1 for update', target_type)
      into current_order using target_id;
    if direction = -1 then
      execute format('select id, sort_order from public.%I where (sort_order, id) < ($1, $2) order by sort_order desc, id desc limit 1 for update', target_type)
        into neighbor_id, neighbor_order using current_order, target_id;
    else
      execute format('select id, sort_order from public.%I where (sort_order, id) > ($1, $2) order by sort_order, id limit 1 for update', target_type)
        into neighbor_id, neighbor_order using current_order, target_id;
    end if;
  end if;

  if current_order is null then raise exception 'Elemento non trovato' using errcode = 'P0002'; end if;
  if neighbor_id is null then return; end if;

  if target_type = 'product_images' then
    update public.product_images set sort_order = neighbor_order where id = target_id;
    update public.product_images set sort_order = current_order where id = neighbor_id;
  else
    execute format('update public.%I set sort_order = $1 where id = $2', target_type) using neighbor_order, target_id;
    execute format('update public.%I set sort_order = $1 where id = $2', target_type) using current_order, neighbor_id;
  end if;
end;
$$;

revoke all on function public.move_catalog_item(text, uuid, integer) from public, anon;
grant execute on function public.move_catalog_item(text, uuid, integer) to authenticated;

create or replace function public.audit_catalog_item_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values ((select auth.uid()), 'catalog_item_update', tg_table_name, new.id, to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;
revoke all on function public.audit_catalog_item_change() from public, anon, authenticated;

create trigger categories_catalog_item_audit after update of active, published_at, sort_order on public.categories
for each row when ((old.active, old.published_at, old.sort_order) is distinct from (new.active, new.published_at, new.sort_order)) execute function public.audit_catalog_item_change();
create trigger products_catalog_item_audit after update of active, published_at, sort_order on public.products
for each row when ((old.active, old.published_at, old.sort_order) is distinct from (new.active, new.published_at, new.sort_order)) execute function public.audit_catalog_item_change();
create trigger services_catalog_item_audit after update of active, published_at, sort_order on public.services
for each row when ((old.active, old.published_at, old.sort_order) is distinct from (new.active, new.published_at, new.sort_order)) execute function public.audit_catalog_item_change();

comment on column public.categories.published_at is 'Null per bozza; valorizzato quando la categoria è pubblicata.';
comment on column public.products.published_at is 'Null per bozza; valorizzato quando il prodotto è pubblicato.';
comment on column public.services.published_at is 'Null per bozza; valorizzato quando il servizio è pubblicato.';
comment on function public.move_catalog_item(text, uuid, integer) is 'Sposta atomicamente un elemento catalogo o una immagine nella sequenza.';
