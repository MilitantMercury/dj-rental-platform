alter table public.app_settings
  add column sender_name text not null default 'Noleggio DJ',
  add column sender_email text not null default '',
  add column owner_notification_email text not null default '',
  add column notify_new_requests boolean not null default true,
  add column notify_quote_responses boolean not null default true,
  add column notify_operational_updates boolean not null default true,
  add column pickup_enabled boolean not null default true,
  add column delivery_enabled boolean not null default true,
  add column pickup_address text not null default '',
  add column pickup_instructions text not null default '',
  add column public_name text not null default 'Noleggio DJ',
  add column public_email text not null default '',
  add column public_phone text not null default '',
  add column whatsapp_url text not null default '',
  add column instagram_url text not null default '',
  add column facebook_url text not null default '',
  add column site_intro text not null default '';

alter table public.app_settings
  add constraint app_settings_logistics_enabled check (pickup_enabled or delivery_enabled),
  add constraint app_settings_sender_name_length check (char_length(sender_name) between 1 and 100),
  add constraint app_settings_public_name_length check (char_length(public_name) between 1 and 100),
  add constraint app_settings_text_lengths check (
    char_length(sender_email) <= 254 and char_length(owner_notification_email) <= 254 and
    char_length(pickup_address) <= 500 and char_length(pickup_instructions) <= 2000 and
    char_length(public_email) <= 254 and char_length(public_phone) <= 40 and
    char_length(whatsapp_url) <= 500 and char_length(instagram_url) <= 500 and
    char_length(facebook_url) <= 500 and char_length(site_intro) <= 1000
  );

create or replace function public.audit_owner_configuration_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  target_id := case when tg_table_name = 'app_settings'
    then '00000000-0000-0000-0000-000000000001'::uuid
    else coalesce(new.user_id, old.user_id) end;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values ((select auth.uid()), lower(tg_table_name || '_' || tg_op), tg_table_name, target_id,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_owner_configuration_change() from public, anon, authenticated;
create trigger app_settings_audit after update on public.app_settings
for each row execute function public.audit_owner_configuration_change();
create trigger staff_profiles_audit after insert or update or delete on public.staff_profiles
for each row execute function public.audit_owner_configuration_change();

comment on column public.app_settings.sender_email is 'Mittente delle comunicazioni email; l invio richiede un provider configurato lato server.';
comment on column public.app_settings.pickup_enabled is 'Rende disponibile al cliente il ritiro gestito dal cliente.';
comment on column public.app_settings.delivery_enabled is 'Rende disponibile al cliente la consegna gestita dal gestore.';

create or replace function public.get_public_app_settings()
returns table (public_name text, public_email text, public_phone text, site_intro text, pickup_enabled boolean, delivery_enabled boolean, pickup_address text, pickup_instructions text)
language sql stable security definer set search_path = '' as $$
  select s.public_name, s.public_email, s.public_phone, s.site_intro, s.pickup_enabled, s.delivery_enabled, s.pickup_address, s.pickup_instructions
  from public.app_settings s where s.id = true
$$;
revoke all on function public.get_public_app_settings() from public;
grant execute on function public.get_public_app_settings() to anon, authenticated;

create or replace function public.notify_active_owners(p_kind text, p_title text, p_body text, p_href text, p_event_key text)
returns void language plpgsql security definer set search_path = '' as $$
declare owner_user_id uuid; enabled boolean;
begin
  select case
    when p_kind = 'request_created' then notify_new_requests
    when p_kind = 'quote_responded' then notify_quote_responses
    else true end into enabled
  from public.app_settings where id = true;
  if not coalesce(enabled, true) then return; end if;
  for owner_user_id in select user_id from public.staff_profiles where role = 'owner' and active = true loop
    perform public.notify_user(owner_user_id, p_kind, p_title, p_body, p_href, p_event_key);
  end loop;
end;
$$;
revoke all on function public.notify_active_owners(text, text, text, text, text) from public, anon, authenticated;
