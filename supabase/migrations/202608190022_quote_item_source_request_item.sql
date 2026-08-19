alter table public.quote_items
  add column source_request_item_id uuid references public.request_items(id) on delete restrict;

create index quote_items_source_request_item_id_idx
  on public.quote_items(source_request_item_id);
