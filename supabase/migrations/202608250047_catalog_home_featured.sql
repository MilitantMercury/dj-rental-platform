alter table public.products add column featured_on_home boolean not null default false;
alter table public.services add column featured_on_home boolean not null default false;

create unique index products_one_featured_on_home on public.products (featured_on_home) where featured_on_home;
create unique index services_one_featured_on_home on public.services (featured_on_home) where featured_on_home;

with first_product as (
  select id from public.products
  where active = true and published_at is not null
    and exists (select 1 from public.product_images where product_id = products.id)
  order by sort_order, created_at, id limit 1
)
update public.products set featured_on_home = true where id in (select id from first_product);

with first_service as (
  select id from public.services
  where active = true and published_at is not null and image_path is not null
  order by sort_order, created_at, id limit 1
)
update public.services set featured_on_home = true where id in (select id from first_service);

create or replace function public.set_catalog_home_feature(
  target_type text,
  target_id uuid,
  target_featured boolean
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select public.current_staff_role()) is distinct from 'owner' then
    raise exception 'Operazione non autorizzata' using errcode = '42501';
  end if;
  if target_type not in ('products', 'services') then
    raise exception 'Tipo contenuto non valido' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('catalog-home-feature:' || target_type));

  if target_type = 'products' then
    if target_featured and not exists (select 1 from public.products where id = target_id and active = true and published_at is not null and exists (select 1 from public.product_images where product_id = target_id)) then
      raise exception 'Il prodotto deve essere attivo, pubblicato e avere almeno un immagine' using errcode = '22023';
    end if;
    if target_featured then update public.products set featured_on_home = false where featured_on_home; end if;
    update public.products set featured_on_home = target_featured where id = target_id;
  else
    if target_featured and not exists (select 1 from public.services where id = target_id and active = true and published_at is not null and image_path is not null) then
      raise exception 'Il servizio deve essere attivo, pubblicato e avere un immagine' using errcode = '22023';
    end if;
    if target_featured then update public.services set featured_on_home = false where featured_on_home; end if;
    update public.services set featured_on_home = target_featured where id = target_id;
  end if;

  if not found then raise exception 'Elemento non trovato' using errcode = 'P0002'; end if;
end;
$$;

revoke all on function public.set_catalog_home_feature(text, uuid, boolean) from public, anon;
grant execute on function public.set_catalog_home_feature(text, uuid, boolean) to authenticated;

drop trigger products_catalog_item_audit on public.products;
drop trigger services_catalog_item_audit on public.services;
create trigger products_catalog_item_audit after update of active, published_at, sort_order, featured_on_home on public.products
for each row when ((old.active, old.published_at, old.sort_order, old.featured_on_home) is distinct from (new.active, new.published_at, new.sort_order, new.featured_on_home)) execute function public.audit_catalog_item_change();
create trigger services_catalog_item_audit after update of active, published_at, sort_order, featured_on_home on public.services
for each row when ((old.active, old.published_at, old.sort_order, old.featured_on_home) is distinct from (new.active, new.published_at, new.sort_order, new.featured_on_home)) execute function public.audit_catalog_item_change();

comment on column public.products.featured_on_home is 'Unico prodotto editoriale mostrato nella composizione hero del catalogo.';
comment on column public.services.featured_on_home is 'Unico servizio editoriale mostrato nella composizione hero del catalogo.';
comment on function public.set_catalog_home_feature(text, uuid, boolean) is 'Seleziona atomicamente al massimo un prodotto o servizio per la composizione hero del catalogo.';
