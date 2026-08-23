create or replace function public.audit_catalog_media_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  row_before jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  row_after jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  target_id uuid := case when tg_op = 'DELETE' then old.id else new.id end;
begin
  if tg_table_name in ('categories', 'services') then
    if tg_op = 'UPDATE'
       and (old.image_path, old.image_alt) is not distinct from (new.image_path, new.image_alt) then
      return new;
    end if;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values ((select auth.uid()), 'catalog_media_' || lower(tg_op), tg_table_name, target_id, row_before, row_after);

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_catalog_media_change() from public, anon, authenticated;

comment on function public.audit_catalog_media_change() is
  'Registra le modifiche ai media senza accedere a colonne specifiche di altre tabelle.';
