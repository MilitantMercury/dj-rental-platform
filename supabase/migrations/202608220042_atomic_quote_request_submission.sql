alter table public.request_items
  add column catalog_snapshot jsonb not null default '{}'::jsonb;

comment on column public.request_items.catalog_snapshot is
  'Snapshot descrittivo del catalogo al momento dell invio; non contiene prezzi o disponibilita interne.';

create or replace function public.submit_quote_request(
  p_event_type text, p_event_start_at timestamptz, p_event_end_at timestamptz,
  p_venue_name text, p_venue_street text, p_venue_number text,
  p_venue_postal_code text, p_venue_city text, p_venue_province text,
  p_venue_country text, p_delivery_responsibility text,
  p_pickup_responsibility text, p_customer_notes text, p_privacy_accepted boolean
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_caller_id uuid := (select auth.uid());
  v_caller_email text;
  v_cart_id uuid;
  v_request_id uuid;
  v_cart_count integer;
  v_copied_count integer;
begin
  if v_caller_id is null or (select public.current_staff_role()) is not null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select users.email into v_caller_email from auth.users users
  where users.id = v_caller_id and users.email_confirmed_at is not null;
  if v_caller_email is null then raise exception 'email_not_verified' using errcode = '42501'; end if;

  if not coalesce(p_privacy_accepted, false)
     or char_length(trim(coalesce(p_event_type, ''))) not between 1 and 100
     or p_event_start_at is null or p_event_end_at is null or p_event_end_at <= p_event_start_at
     or char_length(trim(coalesce(p_venue_name, ''))) not between 1 and 160
     or char_length(trim(coalesce(p_venue_street, ''))) not between 1 and 160
     or char_length(trim(coalesce(p_venue_number, ''))) not between 1 and 20
     or coalesce(p_venue_postal_code, '') !~ '^[0-9]{5}$'
     or char_length(trim(coalesce(p_venue_city, ''))) not between 1 and 100
     or coalesce(p_venue_province, '') !~ '^[A-Z]{2}$'
     or coalesce(p_venue_country, '') <> 'Italia'
     or coalesce(p_delivery_responsibility, '') not in ('owner', 'customer')
     or coalesce(p_pickup_responsibility, '') not in ('owner', 'customer')
     or char_length(coalesce(p_customer_notes, '')) > 2000 then
    raise exception 'invalid_request' using errcode = '22023';
  end if;

  select carts.id into v_cart_id from public.carts carts
  where carts.customer_user_id = v_caller_id for update;
  if v_cart_id is null then raise exception 'empty_cart' using errcode = '22023'; end if;
  perform 1 from public.cart_items items where items.cart_id = v_cart_id for update;
  select count(*) into v_cart_count from public.cart_items items where items.cart_id = v_cart_id;
  if v_cart_count = 0 then raise exception 'empty_cart' using errcode = '22023'; end if;

  insert into public.requests (
    customer_user_id, customer_email, status, event_type, event_date, event_end_date,
    event_start_at, event_end_at, venue_name, venue_address, venue_street, venue_number,
    venue_postal_code, venue_city, venue_province, venue_country, logistics_mode,
    delivery_responsibility, pickup_responsibility, customer_notes, privacy_accepted_at
  ) values (
    v_caller_id, v_caller_email, 'received', trim(p_event_type),
    (p_event_start_at at time zone 'Europe/Rome')::date,
    (p_event_end_at at time zone 'Europe/Rome')::date,
    p_event_start_at, p_event_end_at, trim(p_venue_name),
    concat_ws(', ', trim(p_venue_street), trim(p_venue_number), p_venue_postal_code, trim(p_venue_city), p_venue_province, p_venue_country),
    trim(p_venue_street), trim(p_venue_number), p_venue_postal_code, trim(p_venue_city),
    p_venue_province, p_venue_country, 'delivery', p_delivery_responsibility,
    p_pickup_responsibility, trim(coalesce(p_customer_notes, '')), now()
  ) returning id into v_request_id;

  insert into public.request_items (request_id, item_type, item_id, description, quantity, catalog_snapshot)
  select v_request_id, item.item_type, coalesce(item.product_id, item.service_id),
    coalesce(product.name, service.name), item.quantity,
    case when item.item_type = 'product'
      then jsonb_build_object('name', product.name, 'slug', product.slug, 'description', product.description,
        'specifications', product.specifications, 'included_accessories', product.included_accessories)
      else jsonb_build_object('name', service.name, 'slug', service.slug, 'description', service.description,
        'conditions', service.conditions)
    end
  from public.cart_items item
  left join public.products product on item.item_type = 'product' and product.id = item.product_id
  left join public.services service on item.item_type = 'service' and service.id = item.service_id
  where item.cart_id = v_cart_id
    and ((product.id is not null and product.active and product.published_at is not null)
      or (service.id is not null and service.active and service.published_at is not null));

  get diagnostics v_copied_count = row_count;
  if v_copied_count <> v_cart_count then raise exception 'catalog_changed' using errcode = 'P0001'; end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after_data)
  values (v_caller_id, 'request_submitted', 'requests', v_request_id,
    jsonb_build_object('item_count', v_copied_count, 'privacy_accepted', true));

  delete from public.cart_items items where items.cart_id = v_cart_id;
  return v_request_id;
end;
$$;

revoke all on function public.submit_quote_request(text, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.submit_quote_request(text, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, boolean) to authenticated;

drop policy if exists "requests_customer_insert_own" on public.requests;
drop policy if exists "request_items_customer_insert" on public.request_items;
revoke insert on table public.requests, public.request_items from authenticated;
