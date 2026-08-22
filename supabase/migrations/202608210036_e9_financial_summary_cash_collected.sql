-- La funzione precedente aveva una firma di ritorno più corta. PostgreSQL non
-- consente di modificarla con CREATE OR REPLACE: la si ricrea mantenendo gli
-- stessi controlli di autorizzazione e i soli dati aggregati pubblicabili.
drop function if exists public.get_request_financial_summary(uuid);

create function public.get_request_financial_summary(p_request_id uuid)
returns table (
  quote_total_cents integer,
  cash_collected_cents integer,
  rental_collected_cents integer,
  rental_outstanding_cents integer,
  deposit_to_return_cents integer
)
language plpgsql security definer set search_path = public as $$
declare
  request_customer_id uuid; revision_status text; quote_total integer := 0;
  cash_collected integer := 0; rental_collected integer := 0; deposit_held integer := 0;
begin
  if auth.uid() is null then raise exception 'Autenticazione richiesta'; end if;
  select request.customer_user_id, revision.status, coalesce(revision.total_cents, 0)
    into request_customer_id, revision_status, quote_total
  from public.requests request join public.quotes quote on quote.request_id = request.id
  left join public.quote_revisions revision on revision.id = quote.current_revision_id
  where request.id = p_request_id;
  if request_customer_id is null then raise exception 'Pratica non trovata'; end if;
  if coalesce(public.current_staff_role()::text, '') <> 'owner' and request_customer_id <> auth.uid() then raise exception 'Permesso negato'; end if;
  if coalesce(public.current_staff_role()::text, '') <> 'owner' and revision_status <> 'published' then raise exception 'Preventivo non disponibile'; end if;
  select
    coalesce(sum(case when record_type in ('deposit_received', 'advance_received', 'balance_received') then amount_cents when record_type = 'deposit_returned' then -amount_cents else 0 end), 0),
    coalesce(sum(case when record_type in ('advance_received', 'balance_received') then amount_cents else 0 end), 0),
    coalesce(sum(case when record_type = 'deposit_received' then amount_cents when record_type = 'deposit_returned' then -amount_cents else 0 end), 0)
    into cash_collected, rental_collected, deposit_held
  from public.financial_records where request_id = p_request_id;
  return query select quote_total, cash_collected, rental_collected, greatest(quote_total - rental_collected, 0), greatest(deposit_held, 0);
end;
$$;

revoke all on function public.get_request_financial_summary(uuid) from public;
grant execute on function public.get_request_financial_summary(uuid) to authenticated;
comment on function public.get_request_financial_summary(uuid) is 'Espone i soli totali economici della pratica: incassato netto, residuo noleggio e cauzione netta.';
