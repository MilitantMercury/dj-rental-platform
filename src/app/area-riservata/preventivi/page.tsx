import Link from "next/link";
import { redirect } from "next/navigation";
import { formatEventDate, formatRomeDateTime } from "@/lib/date-time";
import { createClient } from "@/lib/supabase/server";
import { respondToQuote } from "./actions";

export const dynamic = "force-dynamic";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const messageCopy: Record<string, string> = {
  "risposta-registrata": "La tua risposta è stata registrata correttamente.",
  "risposta-non-disponibile": "Questa proposta non è più disponibile per una risposta. Consulta la proposta attuale qui sotto.",
  "risposta-non-valida": "Scegli una risposta valida e riprova.",
};
const outcomeCopy: Record<string, string> = {
  accepted: "Accettata",
  changes_requested: "Modifiche richieste",
  rejected: "Rifiutata",
};

export default async function CustomerQuotes({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");

  const { data: quotes } = await supabase.from("quotes").select("request_id,current_revision_id").not("current_revision_id", "is", null);
  const revisionIds = (quotes ?? []).map((quote) => quote.current_revision_id).filter((id): id is string => Boolean(id));
  const requestIds = (quotes ?? []).map((quote) => quote.request_id);
  const { data: requests } = requestIds.length
    ? await supabase.from("requests").select("id,request_code,event_type,event_date,event_end_date,venue_name,venue_address").in("id", requestIds)
    : { data: [] };
  const { data: revisions } = revisionIds.length
    ? await supabase.from("quote_revisions").select("id,revision_number,total_cents,deposit_cents,conditions,published_at").in("id", revisionIds).eq("status", "published").order("published_at", { ascending: false })
    : { data: [] };
  const { data: responses } = revisionIds.length
    ? await supabase.from("quote_responses").select("revision_id,outcome,comment,created_at").eq("customer_user_id", user.id).in("revision_id", revisionIds)
    : { data: [] };
  const responseByRevision = new Map((responses ?? []).map((response) => [response.revision_id, response]));
  const requestById = new Map((requests ?? []).map((request) => [request.id, request]));
  const requestByRevision = new Map((quotes ?? []).flatMap((quote) => quote.current_revision_id ? [[quote.current_revision_id, requestById.get(quote.request_id)] as const] : []));

  return <main className="dashboard shell quotes-page">
    <Link href="/area-riservata">← Area riservata</Link>
    <header className="quotes-header"><div><p className="eyebrow dark">Preventivi</p><h1>Le tue proposte.</h1><p>Consulta le proposte attuali e comunica la tua decisione al gestore.</p></div><div className="quotes-count"><strong>{revisions?.length ?? 0}</strong> proposte attive</div></header>
    {message && <div className="quotes-message" role="status">{messageCopy[message] ?? "Operazione completata."}</div>}
    {revisions?.length ? <section className="quotes-list" aria-label="Proposte ricevute">{revisions.map((revision) => {
      const response = responseByRevision.get(revision.id);
      const request = requestByRevision.get(revision.id);
      return <article className="quote-card" id={`preventivo-${revision.id}`} key={revision.id}>
        <div className="quote-card-top"><span>Revisione {revision.revision_number}</span><time dateTime={revision.published_at ?? undefined}>Pubblicata {revision.published_at ? formatRomeDateTime(revision.published_at) : "—"}</time></div>
        <div className="quote-card-summary"><div><p className="detail-label">Per la richiesta {request?.request_code ?? "—"}</p><h2>{request?.event_type ?? "La proposta per il tuo evento"}</h2>{request && <p className="quote-request-details">{formatEventDate(request.event_date)} → {formatEventDate(request.event_end_date)} · {request.venue_name}<br />{request.venue_address}</p>}<Link className="quote-request-link" href={`/area-riservata/richieste/${request?.id}`} target="_blank" rel="noreferrer">Apri richiesta <span aria-hidden="true">↗</span></Link></div><strong>{euro.format(revision.total_cents / 100)}</strong></div>
        <dl className="quote-totals"><div><dt>Totale proposta</dt><dd>{euro.format(revision.total_cents / 100)}</dd></div><div><dt>Cauzione</dt><dd>{euro.format(revision.deposit_cents / 100)}</dd></div></dl>
        {revision.conditions && <section className="quote-conditions"><p className="detail-label">Condizioni</p><p>{revision.conditions}</p></section>}
        {response ? <section className={`quote-response-summary is-${response.outcome}`}><p className="detail-label">La tua risposta</p><h3>{outcomeCopy[response.outcome] ?? "Risposta registrata"}</h3><time dateTime={response.created_at}>{formatRomeDateTime(response.created_at)}</time>{response.comment && <p>{response.comment}</p>}</section> : <form className="quote-response" action={respondToQuote}><input type="hidden" name="revisionId" value={revision.id} /><label><span>Messaggio per il gestore <small>facoltativo</small></span><textarea name="comment" rows={3} maxLength={2000} placeholder="Scrivi qui eventuali note o richieste." /></label><div className="quote-response-actions"><button className="quote-accept" name="outcome" value="accepted">Accetta proposta</button><button className="quote-changes" name="outcome" value="changes_requested">Chiedi modifiche</button><button className="quote-reject" name="outcome" value="rejected">Rifiuta</button></div></form>}
      </article>;
    })}</section> : <section className="quotes-empty"><p className="detail-label">Nessuna proposta attiva</p><h2>Quando il gestore preparerà una proposta, la troverai qui.</h2><p>Puoi intanto controllare le tue richieste o continuare a esplorare il catalogo.</p><div><Link href="/area-riservata/richieste">Le mie richieste →</Link><Link href="/catalogo">Esplora il catalogo →</Link></div></section>}
  </main>;
}
