create or replace function public.confirm_request_if_available(
  p_request_id uuid,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status text;
  target_start_date date;
  target_end_date date;
  margin_days integer;
  required_deposit_cents integer := 0;
  collected_deposit_cents integer := 0;
  inventory_row record;
  stock_quantity integer;
  occupied_quantity integer;
  conflicts jsonb := '[]'::jsonb;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  select status, event_date, event_end_date
    into target_status, target_start_date, target_end_date
  from public.requests
  where id = p_request_id
  for update;

  if target_status is null then
    raise exception 'Pratica non trovata';
  end if;

  if target_status not in ('accepted', 'awaiting_deposit') then
    return jsonb_build_object('confirmed', false, 'reason', 'stato_non_valido', 'conflicts', conflicts);
  end if;

  select coalesce(revision.deposit_cents, 0)
    into required_deposit_cents
  from public.quotes quote
  left join public.quote_revisions revision on revision.id = quote.current_revision_id
  where quote.request_id = p_request_id;

  select coalesce(sum(
    case record_type
      when 'deposit_received' then amount_cents
      when 'deposit_returned' then -amount_cents
      else 0
    end
  ), 0)
    into collected_deposit_cents
  from public.financial_records
  where request_id = p_request_id;

  if required_deposit_cents > 0 and collected_deposit_cents < required_deposit_cents then
    return jsonb_build_object(
      'confirmed', false,
      'reason', 'caparra_non_registrata',
      'required_deposit_cents', required_deposit_cents,
      'collected_deposit_cents', collected_deposit_cents,
      'conflicts', conflicts
    );
  end if;

  select operational_margin_days into margin_days from public.app_settings where id = true;
  margin_days := coalesce(margin_days, 0);

  for inventory_row in
    select item_id as product_id, sum(quantity)::integer as requested_quantity
    from public.request_items
    where request_id = p_request_id and item_type = 'product'
    group by item_id
    order by item_id
  loop
    select total_quantity into stock_quantity
    from public.inventory_stock
    where product_id = inventory_row.product_id
    for update;

    if stock_quantity is null then
      conflicts := conflicts || jsonb_build_array(jsonb_build_object(
        'product_id', inventory_row.product_id,
        'requested_quantity', inventory_row.requested_quantity,
        'available_quantity', 0,
        'reason', 'giacenza_non_configurata'
      ));
      continue;
    end if;

    select coalesce(max(coalesce(unavailable.quantity, 0) + coalesce(reserved.quantity, 0)), 0)
      into occupied_quantity
    from generate_series(
      (target_start_date - margin_days)::timestamp,
      (target_end_date + margin_days)::timestamp,
      interval '1 day'
    ) as scheduled(day)
    left join lateral (
      select sum(quantity)::integer as quantity
      from public.inventory_unavailability
      where product_id = inventory_row.product_id
        and (start_date is null or start_date <= scheduled.day::date)
        and (end_date is null or end_date >= scheduled.day::date)
    ) unavailable on true
    left join lateral (
      select sum(request_item.quantity)::integer as quantity
      from public.requests existing_request
      join public.request_items request_item on request_item.request_id = existing_request.id
      where existing_request.id <> p_request_id
        and existing_request.status in ('option', 'awaiting_deposit', 'confirmed', 'preparing', 'delivered_or_collected', 'returned')
        and request_item.item_type = 'product'
        and request_item.item_id = inventory_row.product_id
        and existing_request.event_date - margin_days <= scheduled.day::date
        and existing_request.event_end_date + margin_days >= scheduled.day::date
    ) reserved on true;

    if stock_quantity - occupied_quantity < inventory_row.requested_quantity then
      conflicts := conflicts || jsonb_build_array(jsonb_build_object(
        'product_id', inventory_row.product_id,
        'requested_quantity', inventory_row.requested_quantity,
        'available_quantity', greatest(stock_quantity - occupied_quantity, 0),
        'reason', 'quantita_insufficiente'
      ));
    end if;
  end loop;

  if jsonb_array_length(conflicts) > 0 then
    return jsonb_build_object('confirmed', false, 'reason', 'disponibilita_insufficiente', 'conflicts', conflicts);
  end if;

  update public.requests set status = 'confirmed' where id = p_request_id and status = target_status;
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note)
  values (p_request_id, target_status, 'confirmed', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Pratica confermata definitivamente dall’owner dopo le verifiche operative.'));

  return jsonb_build_object('confirmed', true, 'conflicts', '[]'::jsonb);
end;
$$;

comment on function public.confirm_request_if_available(uuid, text) is 'Conferma atomicamente una pratica dopo verifica caparra (se prevista) e disponibilità.';
