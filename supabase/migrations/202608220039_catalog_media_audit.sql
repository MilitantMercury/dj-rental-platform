create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(user_id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 1 and 120),
  constraint audit_logs_entity_type_length check (char_length(entity_type) between 1 and 80)
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
alter table public.audit_logs enable row level security;
create policy "audit_logs_owner_select" on public.audit_logs for select to authenticated
using ((select public.current_staff_role()) = 'owner');
revoke all on table public.audit_logs from anon, authenticated;
grant select on table public.audit_logs to authenticated;

create or replace function public.audit_catalog_media_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  row_before jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  row_after jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  target_id uuid := case when tg_op = 'DELETE' then old.id else new.id end;
begin
  if tg_table_name in ('categories', 'services')
     and tg_op = 'UPDATE'
     and (old.image_path, old.image_alt) is not distinct from (new.image_path, new.image_alt) then
    return new;
  end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values ((select auth.uid()), 'catalog_media_' || lower(tg_op), tg_table_name, target_id, row_before, row_after);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_catalog_media_change() from public, anon, authenticated;

create trigger categories_media_audit after update of image_path, image_alt on public.categories
for each row execute function public.audit_catalog_media_change();
create trigger services_media_audit after update of image_path, image_alt on public.services
for each row execute function public.audit_catalog_media_change();
create trigger product_images_media_audit after insert or update or delete on public.product_images
for each row execute function public.audit_catalog_media_change();

comment on table public.audit_logs is 'Audit append-only delle operazioni critiche; inizialmente popolato dalla gestione media catalogo.';
