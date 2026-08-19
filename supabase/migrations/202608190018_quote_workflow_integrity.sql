create or replace function public.prevent_published_quote_revision_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'published' then
    raise exception 'Le revisioni pubblicate sono immutabili';
  end if;

  if new.status = 'published' then
    new.published_at := coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

create trigger quote_revisions_immutable_after_publication
before update on public.quote_revisions
for each row execute function public.prevent_published_quote_revision_changes();

create or replace function public.prevent_published_quote_item_changes()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_revision_id uuid := coalesce(new.revision_id, old.revision_id);
  target_status text;
begin
  select status into target_status
  from public.quote_revisions
  where id = target_revision_id;

  if target_status is distinct from 'draft' then
    raise exception 'Le voci di una revisione non modificabile non possono essere alterate';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger quote_items_mutable_only_on_draft
before insert or update or delete on public.quote_items
for each row execute function public.prevent_published_quote_item_changes();

drop policy if exists "responses customer insert" on public.quote_responses;
revoke insert, update, delete on public.quote_responses from authenticated;

create unique index quote_responses_one_per_customer_revision
on public.quote_responses (revision_id, customer_user_id);

create or replace function public.respond_to_current_quote(
  p_revision_id uuid,
  p_outcome text,
  p_comment text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_request_id uuid;
  current_revision_id uuid;
  revision_status text;
  request_status text;
  target_status text;
begin
  if auth.uid() is null then
    raise exception 'Autenticazione richiesta';
  end if;

  if p_outcome not in ('accepted', 'rejected', 'changes_requested') then
    raise exception 'Risposta al preventivo non valida';
  end if;

  select q.request_id, q.current_revision_id, revision.status, request.status
    into target_request_id, current_revision_id, revision_status, request_status
  from public.quote_revisions revision
  join public.quotes q on q.id = revision.quote_id
  join public.requests request on request.id = q.request_id
  where revision.id = p_revision_id
    and request.customer_user_id = auth.uid();

  if target_request_id is null
    or current_revision_id is distinct from p_revision_id
    or revision_status <> 'published'
    or request_status <> 'quote_published' then
    raise exception 'Questo preventivo non è più disponibile per una risposta';
  end if;

  target_status := case p_outcome
    when 'accepted' then 'accepted'
    when 'rejected' then 'rejected'
    else 'changes_requested'
  end;

  insert into public.quote_responses (revision_id, customer_user_id, outcome, comment)
  values (p_revision_id, auth.uid(), p_outcome, left(coalesce(p_comment, ''), 2000));

  update public.requests
  set status = target_status
  where id = target_request_id;

  insert into public.request_status_history (
    request_id, previous_status, new_status, changed_by, note
  ) values (
    target_request_id,
    request_status,
    target_status,
    auth.uid(),
    case p_outcome
      when 'accepted' then 'Preventivo accettato dal cliente.'
      when 'rejected' then 'Preventivo rifiutato dal cliente.'
      else 'Il cliente ha richiesto modifiche al preventivo.'
    end
  );
end;
$$;

grant execute on function public.respond_to_current_quote(uuid, text, text) to authenticated;

create or replace function public.publish_quote_revision(
  p_revision_id uuid,
  p_discount_cents integer,
  p_deposit_cents integer,
  p_conditions text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_quote_id uuid;
  target_request_id uuid;
  revision_status text;
  request_status text;
  subtotal integer;
begin
  if public.current_staff_role() <> 'owner' then
    raise exception 'Permesso negato';
  end if;

  if p_discount_cents < 0 or p_deposit_cents < 0 then
    raise exception 'Gli importi non possono essere negativi';
  end if;

  select revision.quote_id, quote.request_id, revision.status, request.status
    into target_quote_id, target_request_id, revision_status, request_status
  from public.quote_revisions revision
  join public.quotes quote on quote.id = revision.quote_id
  join public.requests request on request.id = quote.request_id
  where revision.id = p_revision_id;

  if target_quote_id is null or revision_status <> 'draft' then
    raise exception 'La bozza non è disponibile per la pubblicazione';
  end if;

  select coalesce(sum(total_cents), 0) into subtotal
  from public.quote_items
  where revision_id = p_revision_id;

  if p_discount_cents > subtotal then
    raise exception 'Lo sconto non può superare il subtotale';
  end if;

  update public.quote_revisions
  set subtotal_cents = subtotal,
      discount_cents = p_discount_cents,
      total_cents = subtotal - p_discount_cents,
      deposit_cents = p_deposit_cents,
      conditions = left(coalesce(p_conditions, ''), 5000),
      status = 'published',
      published_at = now()
  where id = p_revision_id;

  update public.quotes
  set current_revision_id = p_revision_id
  where id = target_quote_id;

  update public.requests
  set status = 'quote_published'
  where id = target_request_id;

  insert into public.request_status_history (
    request_id, previous_status, new_status, changed_by, note
  ) values (
    target_request_id,
    request_status,
    'quote_published',
    auth.uid(),
    'Preventivo pubblicato e inviato al cliente.'
  );
end;
$$;

grant execute on function public.publish_quote_revision(uuid, integer, integer, text) to authenticated;
