create or replace function public.register_request_delivery(p_request_id uuid, p_note text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_status text;
  list_id uuid;
  incomplete_count integer := 0;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  select status into previous_status from public.requests where id = p_request_id for update;
  if previous_status <> 'preparing' then
    return jsonb_build_object('updated', false, 'reason', 'stato_non_valido');
  end if;

  select id into list_id from public.preparation_lists where request_id = p_request_id for update;
  if list_id is not null then
    select count(*) into incomplete_count from public.preparation_items where preparation_list_id = list_id and prepared_quantity < expected_quantity;
    if incomplete_count > 0 then
      return jsonb_build_object('updated', false, 'reason', 'preparazione_incompleta', 'incomplete_items', incomplete_count);
    end if;
    update public.preparation_items
      set delivered_quantity = expected_quantity,
          status = 'delivered',
          updated_by = auth.uid()
      where preparation_list_id = list_id;
  end if;

  update public.requests set status = 'delivered_or_collected' where id = p_request_id and status = 'preparing';
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note)
  values (p_request_id, 'preparing', 'delivered_or_collected', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Consegna o ritiro del materiale registrati.'));
  return jsonb_build_object('updated', true);
end;
$$;

create or replace function public.register_request_return(p_request_id uuid, p_note text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_status text;
  list_id uuid;
  incomplete_count integer := 0;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  select status into previous_status from public.requests where id = p_request_id for update;
  if previous_status <> 'delivered_or_collected' then
    return jsonb_build_object('updated', false, 'reason', 'stato_non_valido');
  end if;

  select id into list_id from public.preparation_lists where request_id = p_request_id for update;
  if list_id is not null then
    select count(*) into incomplete_count from public.preparation_items where preparation_list_id = list_id and returned_quantity < delivered_quantity;
    if incomplete_count > 0 then
      return jsonb_build_object('updated', false, 'reason', 'rientro_incompleto', 'incomplete_items', incomplete_count);
    end if;
  end if;

  update public.requests set status = 'returned' where id = p_request_id and status = 'delivered_or_collected';
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note)
  values (p_request_id, 'delivered_or_collected', 'returned', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Rientro del materiale verificato.'));
  return jsonb_build_object('updated', true);
end;
$$;

create or replace function public.close_request(p_request_id uuid, p_note text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_status text;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then
    raise exception 'Permesso negato';
  end if;
  select status into previous_status from public.requests where id = p_request_id for update;
  if previous_status <> 'returned' then
    return jsonb_build_object('updated', false, 'reason', 'stato_non_valido');
  end if;
  update public.requests set status = 'closed' where id = p_request_id and status = 'returned';
  insert into public.request_status_history (request_id, previous_status, new_status, changed_by, note)
  values (p_request_id, 'returned', 'closed', auth.uid(), coalesce(nullif(left(trim(p_note), 2000), ''), 'Pratica chiusa dall’owner dopo le verifiche finali.'));
  return jsonb_build_object('updated', true);
end;
$$;

grant execute on function public.register_request_delivery(uuid, text), public.register_request_return(uuid, text), public.close_request(uuid, text) to authenticated;
