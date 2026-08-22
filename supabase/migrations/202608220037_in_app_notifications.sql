create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(user_id) on delete restrict,
  kind text not null,
  title text not null,
  body text not null,
  href text not null,
  event_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_kind_check check (kind in ('request_created', 'request_status_changed', 'quote_published', 'quote_responded', 'request_assigned')),
  constraint notifications_title_length check (char_length(title) between 1 and 120),
  constraint notifications_body_length check (char_length(body) between 1 and 300),
  constraint notifications_href_internal check (href ~ '^/area-riservata(?:/|$)'),
  constraint notifications_event_key_length check (char_length(event_key) between 1 and 200),
  unique (recipient_user_id, event_key)
);

create index notifications_recipient_created_idx on public.notifications (recipient_user_id, created_at desc);
create index notifications_recipient_unread_idx on public.notifications (recipient_user_id, created_at desc) where read_at is null;

create trigger notifications_set_updated_at before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
for select to authenticated
using (recipient_user_id = (select auth.uid()));

create policy "notifications_update_own" on public.notifications
for update to authenticated
using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

revoke all on table public.notifications from anon, authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create or replace function public.notify_user(
  p_recipient_user_id uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_href text,
  p_event_key text
) returns void
language sql security definer set search_path = '' as $$
  insert into public.notifications (recipient_user_id, kind, title, body, href, event_key)
  values (p_recipient_user_id, p_kind, p_title, p_body, p_href, p_event_key)
  on conflict (recipient_user_id, event_key) do nothing;
$$;

revoke all on function public.notify_user(uuid, text, text, text, text, text) from public, anon, authenticated;

create or replace function public.notify_active_owners(
  p_kind text,
  p_title text,
  p_body text,
  p_href text,
  p_event_key text
) returns void
language plpgsql security definer set search_path = '' as $$
declare owner_user_id uuid;
begin
  for owner_user_id in
    select staff.user_id from public.staff_profiles staff
    where staff.role = 'owner' and staff.active = true
  loop
    perform public.notify_user(owner_user_id, p_kind, p_title, p_body, p_href, p_event_key);
  end loop;
end;
$$;

revoke all on function public.notify_active_owners(text, text, text, text, text) from public, anon, authenticated;

create or replace function public.create_request_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.notify_active_owners(
    'request_created',
    'Nuova richiesta ricevuta',
    'La pratica ' || new.request_code || ' è pronta per la verifica.',
    '/area-riservata/pratiche/' || new.id,
    'request-created:' || new.id
  );
  return new;
end;
$$;

create trigger requests_create_notification after insert on public.requests
for each row execute function public.create_request_notification();

create or replace function public.create_status_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_user_id uuid;
  code text;
begin
  select customer_user_id, request_code into target_user_id, code
  from public.requests where id = new.request_id;
  if target_user_id is not null and new.changed_by is distinct from target_user_id then
    perform public.notify_user(
      target_user_id,
      'request_status_changed',
      'Stato richiesta aggiornato',
      'La pratica ' || code || ' ha un nuovo aggiornamento.',
      '/area-riservata/richieste/' || new.request_id,
      'request-status:' || new.id
    );
  end if;
  return new;
end;
$$;

create trigger request_status_create_notification after insert on public.request_status_history
for each row execute function public.create_status_notification();

create or replace function public.create_quote_published_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_user_id uuid;
  target_request_id uuid;
  code text;
begin
  if new.status = 'published' and old.status is distinct from new.status then
    select r.customer_user_id, r.id, r.request_code
    into target_user_id, target_request_id, code
    from public.quotes q join public.requests r on r.id = q.request_id
    where q.id = new.quote_id;
    perform public.notify_user(
      target_user_id,
      'quote_published',
      'Nuovo preventivo disponibile',
      'È disponibile la revisione ' || new.revision_number || ' per la pratica ' || code || '.',
      '/area-riservata/preventivi',
      'quote-published:' || new.id
    );
  end if;
  return new;
end;
$$;

create trigger quote_revision_publish_notification after update of status on public.quote_revisions
for each row execute function public.create_quote_published_notification();

create or replace function public.create_quote_response_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_request_id uuid;
  code text;
begin
  select r.id, r.request_code into target_request_id, code
  from public.quote_revisions revision
  join public.quotes q on q.id = revision.quote_id
  join public.requests r on r.id = q.request_id
  where revision.id = new.revision_id;
  perform public.notify_active_owners(
    'quote_responded',
    'Risposta a un preventivo',
    'Il cliente ha risposto al preventivo della pratica ' || code || '.',
    '/area-riservata/pratiche/' || target_request_id,
    'quote-response:' || new.id
  );
  return new;
end;
$$;

create trigger quote_response_create_notification after insert on public.quote_responses
for each row execute function public.create_quote_response_notification();

create or replace function public.create_assignment_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare code text;
begin
  select request_code into code from public.requests where id = new.request_id;
  perform public.notify_user(
    new.staff_user_id,
    'request_assigned',
    'Nuova pratica assegnata',
    'Sei stato assegnato alla pratica ' || code || '.',
    '/area-riservata/pratiche/' || new.request_id,
    'request-assigned:' || new.request_id || ':' || new.staff_user_id
  );
  return new;
end;
$$;

create trigger request_assignment_create_notification after insert on public.request_assignments
for each row execute function public.create_assignment_notification();

comment on table public.notifications is 'Notifiche interne per singolo destinatario; il payload non contiene dati economici o note amministrative.';
