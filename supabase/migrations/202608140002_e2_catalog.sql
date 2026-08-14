create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_length check (char_length(name) between 1 and 120),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  included_accessories text not null default '',
  reference_price_cents integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_length check (char_length(name) between 1 and 160),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_reference_price check (reference_price_cents is null or reference_price_cents >= 0)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  reference_price_cents integer,
  conditions text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_name_length check (char_length(name) between 1 and 160),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_reference_price check (reference_price_cents is null or reference_price_cents >= 0)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_alt_length check (char_length(alt_text) <= 250)
);

create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.product_images enable row level security;

create policy "catalog_owner_all_categories" on public.categories for all to authenticated
using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');
create policy "catalog_owner_all_products" on public.products for all to authenticated
using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');
create policy "catalog_owner_all_services" on public.services for all to authenticated
using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');
create policy "catalog_owner_all_product_images" on public.product_images for all to authenticated
using ((select public.current_staff_role()) = 'owner') with check ((select public.current_staff_role()) = 'owner');

revoke all on table public.categories, public.products, public.services, public.product_images from anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.services, public.product_images to authenticated;

comment on table public.categories is 'Catalogo amministrativo: categorie e sottocategorie.';
comment on table public.products is 'Attrezzatura noleggiabile; gli importi sono centesimi interi.';
comment on table public.services is 'Servizi professionali con prezzo indicativo in centesimi interi.';
comment on table public.product_images is 'Metadati di file privati nel bucket Storage del catalogo.';
