alter table public.requests add column option_expires_at timestamptz;
create index requests_option_expires_at_idx on public.requests (option_expires_at) where status = 'option';

create or replace function public.place_request_on_option(p_request_id uuid, p_note text default '')
returns timestamptz language plpgsql security definer set search_path = public as $$
declare expires_at timestamptz; current_status text;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then raise exception 'Permesso negato'; end if;
  select status into current_status from public.requests where id = p_request_id for update;
  if current_status <> 'quote_published' then raise exception 'La pratica non può essere messa in opzione'; end if;
  select now() + make_interval(hours => option_duration_hours) into expires_at from public.app_settings where id = true;
  update public.requests set status = 'option', option_expires_at = expires_at where id = p_request_id;
  insert into public.request_status_history (request_id,previous_status,new_status,changed_by,note) values (p_request_id,current_status,'option',auth.uid(),coalesce(nullif(left(trim(p_note),2000),''),'Pratica messa in opzione.'));
  return expires_at;
end;
$$;
grant execute on function public.place_request_on_option(uuid, text) to authenticated;

create or replace function public.expire_due_options()
returns integer language plpgsql security definer set search_path = public as $$
declare changed_count integer;
begin
  if coalesce(public.current_staff_role()::text, '') <> 'owner' then raise exception 'Permesso negato'; end if;
  with expired as (update public.requests set status='expired' where status='option' and option_expires_at <= now() returning id)
  insert into public.request_status_history (request_id,previous_status,new_status,changed_by,note)
  select id,'option','expired',auth.uid(),'Opzione scaduta automaticamente.' from expired;
  get diagnostics changed_count = row_count;
  return changed_count;
end;
$$;
grant execute on function public.expire_due_options() to authenticated;
