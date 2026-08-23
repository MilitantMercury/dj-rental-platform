create or replace function public.audit_owner_configuration_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid;
begin
  if tg_table_name = 'app_settings' then
    target_id := '00000000-0000-0000-0000-000000000001'::uuid;
  elsif tg_op = 'DELETE' then
    target_id := old.user_id;
  else
    target_id := new.user_id;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    (select auth.uid()),
    lower(tg_table_name || '_' || tg_op),
    tg_table_name,
    target_id,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_owner_configuration_change() from public, anon, authenticated;

comment on function public.audit_owner_configuration_change() is
  'Audit delle impostazioni e dei profili staff con identificativo risolto senza accedere a colonne assenti.';
