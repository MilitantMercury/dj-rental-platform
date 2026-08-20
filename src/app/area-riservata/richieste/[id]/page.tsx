import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEventDate, formatRomeLongDate } from "@/lib/date-time";
import { requestStatusLabel } from "@/lib/request-status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const responsibilityLabel = (value: string) => value === "owner" ? "A carico del gestore" : "A carico del cliente";

export default async function CustomerRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const [{ data: request }, { data: items }, { data: quote }] = await Promise.all([
    supabase.from("requests").select("id,request_code,status,event_type,event_date,event_end_date,venue_name,venue_address,delivery_responsibility,pickup_responsibility,customer_notes,created_at").eq("id", id).eq("customer_user_id", user.id).maybeSingle(),
    supabase.from("request_items").select("id,item_type,description,quantity").eq("request_id", id).order("created_at"),
    supabase.from("quotes").select("current_revision_id").eq("request_id", id).maybeSingle(),
  ]);
  if (!request) notFound();
  const { data: revision } = quote?.current_revision_id
    ? await supabase.from("quote_revisions").select("id,revision_number,status").eq("id", quote.current_revision_id).eq("status", "published").maybeSingle()
    : { data: null };
  const products = (items ?? []).filter((item) => item.item_type === "product");
  const services = (items ?? []).filter((item) => item.item_type === "service");
  const totalItems = (items ?? []).reduce((total, item) => total + item.quantity, 0);
  const renderItems = (selection: typeof products, empty: string) => selection.length ? <ul className="practice-items-list">{selection.map((item) => <li key={item.id}><span>{item.description}</span><strong>× {item.quantity}</strong></li>)}</ul> : <p className="practice-items-empty">{empty}</p>;
  const quoteCallout = request.status === "accepted"
    ? { title: "Proposta accettata.", text: `Hai accettato la revisione ${revision?.revision_number}. Il gestore verificherà i dettagli e confermerà la pratica.`, link: "Rivedi preventivo" }
    : request.status === "changes_requested"
      ? { title: "Modifiche richieste.", text: `Hai chiesto modifiche alla revisione ${revision?.revision_number}. Il gestore preparerà una nuova proposta.`, link: "Rivedi preventivo" }
      : request.status === "confirmed"
        ? { title: "Pratica confermata.", text: `Il gestore ha confermato la revisione ${revision?.revision_number}.`, link: "Rivedi preventivo" }
        : request.status === "closed"
          ? { title: "Pratica chiusa.", text: `La pratica relativa alla revisione ${revision?.revision_number} è conclusa.`, link: "Rivedi preventivo" }
          : request.status === "rejected"
            ? { title: "Proposta rifiutata.", text: `Hai rifiutato la revisione ${revision?.revision_number}.`, link: "Rivedi preventivo" }
            : { title: "Hai ricevuto una proposta.", text: `Consulta la revisione ${revision?.revision_number}, verifica condizioni e importi, poi comunica la tua decisione.`, link: "Apri preventivo" };

  return <main className="dashboard shell practice-detail-page">
    <Link href="/area-riservata/richieste">← Torna alle richieste</Link>
    <div className="practice-detail-header"><div><p className="eyebrow dark">{request.request_code}</p><h1>{request.event_type}</h1><p className="practice-detail-subtitle">Richiesta inviata il {formatRomeLongDate(request.created_at)}</p></div><strong className="status-badge">{requestStatusLabel(request.status)}</strong></div>
    {revision && <section className="customer-quote-callout"><div><p className="detail-label">{request.status === "accepted" ? "Proposta accettata" : request.status === "changes_requested" ? "Modifiche richieste" : request.status === "confirmed" ? "Pratica confermata" : request.status === "closed" ? "Pratica chiusa" : request.status === "rejected" ? "Proposta rifiutata" : "Preventivo disponibile"}</p><h2>{quoteCallout.title}</h2><p>{quoteCallout.text}</p></div><Link href={`/area-riservata/preventivi?richiesta=${request.id}#preventivo-${revision.id}`} target="_blank" rel="noreferrer">{quoteCallout.link} <span aria-hidden="true">↗</span></Link></section>}
    <section className="practice-items-section"><div className="practice-items-heading"><div><p className="detail-label">La tua selezione</p><h2>Materiali e servizi richiesti</h2></div><strong>{totalItems} pezzi</strong></div>{items?.length ? <div className="practice-items-columns"><div><h3>Attrezzatura <span>{products.length}</span></h3>{renderItems(products, "Nessuna attrezzatura.")}</div><div><h3>Servizi <span>{services.length}</span></h3>{renderItems(services, "Nessun servizio.")}</div></div> : <p className="practice-items-empty">Non sono presenti articoli in questa richiesta.</p>}</section>
    <div className="practice-detail-grid"><section className="practice-detail-card"><p className="detail-label">Evento</p><dl className="detail-list"><div><dt>Data inizio</dt><dd>{formatEventDate(request.event_date)}</dd></div><div><dt>Data fine</dt><dd>{formatEventDate(request.event_end_date)}</dd></div></dl></section><section className="practice-detail-card"><p className="detail-label">Location</p><h2>{request.venue_name}</h2><p>{request.venue_address}</p></section><section className="practice-detail-card"><p className="detail-label">Logistica</p><dl className="detail-list"><div><dt>Consegna</dt><dd>{responsibilityLabel(request.delivery_responsibility)}</dd></div><div><dt>Ritiro</dt><dd>{responsibilityLabel(request.pickup_responsibility)}</dd></div></dl></section>{request.customer_notes && <section className="practice-detail-card practice-detail-notes"><p className="detail-label">Le tue note</p><p>{request.customer_notes}</p></section>}</div>
  </main>;
}
