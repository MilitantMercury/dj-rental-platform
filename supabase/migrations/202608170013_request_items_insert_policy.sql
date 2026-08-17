create policy "request_items_customer_insert"
on public.request_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.requests r
    where r.id = request_id
      and r.customer_user_id = (select auth.uid())
  )
);
