create table public.request_items (id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests(id) on delete restrict, item_type text not null, item_id uuid not null, description text not null, quantity integer not null default 1, created_at timestamptz not null default now(), constraint request_items_type check (item_type in ('product','service')), constraint request_items_quantity check (quantity > 0));
alter table public.request_items enable row level security;
create policy "request_items_staff" on public.request_items for select to authenticated using ((select public.current_staff_role()) is not null);
create policy "request_items_customer" on public.request_items for select to authenticated using (exists (select 1 from public.requests r where r.id=request_id and r.customer_user_id=(select auth.uid())));
grant select, insert on public.request_items to authenticated;
