import Link from "next/link";
import { redirect } from "next/navigation";
import { formatEventDateTime, formatRomeDateTime } from "@/lib/date-time";
import { requestStatusLabel, requestStatusTone } from "@/lib/request-status";
import { createClient } from "@/lib/supabase/server";
import { AppMessage } from "@/components/app-message";
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

export default async function CustomerQuotes({ searchParams }: { searchParams: Promise<{ message?: string; richiesta?: string }> }) {
  const { message, richiesta: expandedRequestId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");

  const { data: quotes } = await supabase.from("quotes").select("id,request_id,current_revision_id");
  const quoteIds = (quotes ?? []).map((quote) => quote.id);
  const requestIds = (quotes ?? []).map((quote) => quote.request_id);
  const { data: requests } = requestIds.length ? await supabase.from("requests").select("id,request_code,status,event_type,event_start_at,event_end_at,venue_name,venue_address").in("id", requestIds) : { data: [] };
  const { data: revisions } = quoteIds.length ? await supabase.from("quote_revisions").select("id,quote_id,revision_number,total_cents,deposit_cents,conditions,published_at").in("quote_id", quoteIds).eq("status", "published").order("published_at", { ascending: false }) : { data: [] };
  const revisionIds = (revisions ?? []).map((revision) => revision.id);
  const { data: responses } = revisionIds.length ? await supabase.from("quote_responses").select("revision_id,outcome,comment,created_at").eq("customer_user_id", user.id).in("revision_id", revisionIds) : { data: [] };

  const requestById = new Map((requests ?? []).map((request) => [request.id, request]));
  const revisionsByQuote = new Map<string, NonNullable<typeof revisions>>();
  for (const revision of revisions ?? []) revisionsByQuote.set(revision.quote_id, [...(revisionsByQuote.get(revision.quote_id) ?? []), revision]);
  const responseByRevision = new Map((responses ?? []).map((response) => [response.revision_id, response]));
  const quoteGroups = (quotes ?? []).map((quote) => ({ quote, request: requestById.get(quote.request_id), revisions: revisionsByQuote.get(quote.id) ?? [] })).filter((group) => group.request && group.revisions.length).sort((first, second) => (second.revisions[0]?.published_at ?? "").localeCompare(first.revisions[0]?.published_at ?? ""));

  return <main className="dashboard shell quotes-page">
    <Link href="/area-riservata">← Area riservata</Link>
    <header className="quotes-header"><div><p className="eyebrow dark">Preventivi</p><h1>Le tue proposte.</h1><p>Apri una pratica per consultare la proposta attuale e lo storico delle sue revisioni.</p></div><div className="quotes-count"><strong>{quoteGroups.length}</strong> pratiche con proposta</div></header>
    {message && <AppMessage message={messageCopy[message] ?? "Operazione completata."} />}
    {quoteGroups.length ? <section className="quotes-list" aria-label="Preventivi per pratica">{quoteGroups.map(({ quote, request, revisions: requestRevisions }) => {
      if (!request) return null;
      const currentRevision = requestRevisions.find((revision) => revision.id === quote.current_revision_id);
      const latestRevision = currentRevision ?? requestRevisions[0];
      return <details className="quote-request" key={quote.id} open={expandedRequestId === request.id}>
        <summary><div className="quote-request-title"><p className="detail-label">{request.request_code}</p><h2>{request.event_type}</h2><p>{formatEventDateTime(request.event_start_at)} → {formatEventDateTime(request.event_end_at)} · {request.venue_name}</p></div><div className="quote-request-summary-meta"><strong>{euro.format(latestRevision.total_cents / 100)}</strong><span className={`status-badge status-badge--${requestStatusTone(request.status)}`}>{requestStatusLabel(request.status)}</span><span className="quote-request-expand" aria-hidden="true" /></div></summary>
        <div className="quote-request-body"><div className="quote-request-body-heading"><div><p className="detail-label">Storico preventivi</p><h3>{requestRevisions.length} {requestRevisions.length === 1 ? "revisione pubblicata" : "revisioni pubblicate"}</h3></div><Link className="quote-request-link" href={`/area-riservata/richieste/${request.id}`} target="_blank" rel="noreferrer">Apri richiesta <span aria-hidden="true">↗</span></Link></div><div className="quote-revision-list">{requestRevisions.map((revision) => {
          const response = responseByRevision.get(revision.id);
          const isCurrent = revision.id === quote.current_revision_id;
          const canRespond = isCurrent && request.status === "quote_published" && !response;
          return <article className="quote-card" id={`preventivo-${revision.id}`} key={revision.id}>
            <div className="quote-card-top"><span>{isCurrent ? `Revisione ${revision.revision_number} · Attuale` : `Revisione ${revision.revision_number}`}</span><time dateTime={revision.published_at ?? undefined}>Pubblicata {revision.published_at ? formatRomeDateTime(revision.published_at) : "—"}</time></div>
            <div className="quote-card-summary"><div><p className="detail-label">Proposta economica</p><h2>{isCurrent ? "La proposta attuale" : "Proposta precedente"}</h2></div><strong>{euro.format(revision.total_cents / 100)}</strong></div>
            <dl className="quote-totals"><div><dt>Totale proposta</dt><dd>{euro.format(revision.total_cents / 100)}</dd></div><div><dt>Cauzione</dt><dd>{euro.format(revision.deposit_cents / 100)}</dd></div></dl>
            {revision.conditions && <section className="quote-conditions"><p className="detail-label">Condizioni</p><p>{revision.conditions}</p></section>}
            {response ? <section className={`quote-response-summary is-${response.outcome}`}><p className="detail-label">La tua risposta</p><h3>{outcomeCopy[response.outcome] ?? "Risposta registrata"}</h3><time dateTime={response.created_at}>{formatRomeDateTime(response.created_at)}</time>{response.comment && <p>{response.comment}</p>}</section> : canRespond ? <form className="quote-response" action={respondToQuote}><input type="hidden" name="revisionId" value={revision.id} /><label><span>Messaggio per il gestore <small>facoltativo</small></span><textarea name="comment" rows={3} maxLength={2000} placeholder="Scrivi qui eventuali note o richieste." /></label><div className="quote-response-actions"><button className="quote-accept" name="outcome" value="accepted">Accetta proposta</button><button className="quote-changes" name="outcome" value="changes_requested">Chiedi modifiche</button><button className="quote-reject" name="outcome" value="rejected">Rifiuta</button></div></form> : null}
          </article>;
        })}</div></div>
      </details>;
    })}</section> : <section className="quotes-empty"><p className="detail-label">Nessuna proposta disponibile</p><h2>Quando il gestore pubblicherà una proposta, la troverai qui.</h2><p>Puoi intanto controllare le tue richieste o continuare a esplorare il catalogo.</p><div><Link href="/area-riservata/richieste">Le mie richieste →</Link><Link href="/catalogo">Esplora il catalogo →</Link></div></section>}
  </main>;
}
