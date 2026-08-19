import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEventDate, formatRomeDateTime, formatRomeLongDate } from "@/lib/date-time";
import { requestStatusDescription, requestStatusLabel } from "@/lib/request-status";
import { createClient } from "@/lib/supabase/server";
import { createQuoteFromRequest, updateRequestStatus } from "../actions";

export const dynamic = "force-dynamic";

const responsibilityLabel = (value: string) =>
  value === "owner" ? "A carico del gestore" : "A carico del cliente";

export default async function PracticeDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { id } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: request } = await supabase
    .from("requests")
    .select(
      "request_code,status,event_type,event_date,event_end_date,venue_name,venue_address,delivery_responsibility,pickup_responsibility,customer_notes,created_at,customer_user_id,customer_email",
    )
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const [customerResult, customerProfileResult, itemsResult, historyResult] =
    await Promise.all([
    supabase
      .from("profiles")
      .select("first_name,last_name,email,phone")
      .eq("user_id", request.customer_user_id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("customer_type,company_name,tax_code,vat_number,address,pec,recipient_code")
      .eq("user_id", request.customer_user_id)
      .maybeSingle(),
    supabase
      .from("request_items")
      .select("id,item_type,description,quantity")
      .eq("request_id", id)
      .order("created_at"),
    supabase
      .from("request_status_history")
      .select("id,previous_status,new_status,note,changed_by,created_at")
      .eq("request_id", id)
      .order("created_at", { ascending: false }),
    ]);

  const customer = customerResult.data;
  const customerProfile = customerProfileResult.data;
  const items = itemsResult.data ?? [];
  const history = historyResult.data ?? [];
  const actorIds = [...new Set(history.map((entry) => entry.changed_by))];
  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("user_id,first_name,last_name")
        .in("user_id", actorIds)
    : { data: [] };
  const actorNames = new Map(
    (actors ?? []).map((actor) => [
      actor.user_id,
      `${actor.first_name} ${actor.last_name}`,
    ]),
  );
  const products = items.filter((item) => item.item_type === "product");
  const services = items.filter((item) => item.item_type === "service");
  const customerName = customerProfile?.customer_type === "business"
    ? customerProfile.company_name || "Azienda non disponibile"
    : customer
      ? `${customer.first_name} ${customer.last_name}`.trim()
      : "Profilo non disponibile";
  const transitions =
    request.status === "received"
      ? ["in_review", "rejected", "cancelled"]
      : request.status === "in_review"
        ? ["received", "rejected", "cancelled"]
        : request.status === "accepted"
          ? ["confirmed"]
        : request.status === "confirmed"
          ? ["closed"]
          : [];
  const feedback =
    message === "stato-aggiornato"
      ? "Stato aggiornato."
      : message === "preventivo-creato"
        ? "Bozza preventivo creata."
        : message;

  return (
    <main className="dashboard shell practice-detail-page">
      <Link href="/area-riservata/pratiche">← Torna alle pratiche</Link>

      <div className="practice-detail-header">
        <div>
          <p className="eyebrow dark">{request.request_code}</p>
          <h1>{request.event_type}</h1>
          <p className="practice-detail-subtitle">
            Richiesta ricevuta il{" "}
            {formatRomeLongDate(request.created_at)}
          </p>
        </div>
        <div>
          <strong className="status-badge">
            {requestStatusLabel(request.status)}
          </strong>
          <p className="status-description">
            {requestStatusDescription(request.status)}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="auth-message" role="status">
          {feedback}
        </div>
      )}

      <section className="practice-items-section">
        <div className="practice-items-heading">
          <div>
            <p className="detail-label">Contenuto della richiesta</p>
            <h2>Materiali e servizi richiesti</h2>
          </div>
          <strong>{items.reduce((total, item) => total + item.quantity, 0)} pezzi</strong>
        </div>

        {items.length ? (
          <div className="practice-items-columns">
            <div>
              <h3>Attrezzatura <span>{products.length}</span></h3>
              {products.length ? (
                <ul className="practice-items-list">
                  {products.map((item) => (
                    <li key={item.id}>
                      <span>{item.description}</span>
                      <strong>× {item.quantity}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="practice-items-empty">Nessuna attrezzatura.</p>
              )}
            </div>
            <div>
              <h3>Servizi <span>{services.length}</span></h3>
              {services.length ? (
                <ul className="practice-items-list">
                  {services.map((item) => (
                    <li key={item.id}>
                      <span>{item.description}</span>
                      <strong>× {item.quantity}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="practice-items-empty">Nessun servizio.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {transitions.length ? (
        <section className="practice-status-panel">
          <p className="detail-label">Gestione pratica</p>
          <form action={updateRequestStatus}>
            <input type="hidden" name="requestId" value={id} />
            <input type="hidden" name="currentStatus" value={request.status} />
            <label>
              Nuovo stato
              <select name="status" required defaultValue="">
                <option value="" disabled>Seleziona un’azione</option>
                {transitions.map((status) => <option key={status} value={status}>{requestStatusLabel(status)}</option>)}
              </select>
            </label>
            <label>Nota interna<textarea name="note" rows={2} placeholder="Facoltativa" /></label>
            <button type="submit">Aggiorna stato</button>
          </form>
        </section>
      ) : null}

      {["received", "in_review"].includes(request.status) && (
        <section className="practice-status-panel">
          <p className="detail-label">Preventivo</p>
          <p>Prepara una bozza economica per questa richiesta.</p>
          <form action={createQuoteFromRequest}><input type="hidden" name="requestId" value={id} /><button type="submit">Crea preventivo</button></form>
        </section>
      )}

      {request.status === "changes_requested" && (
        <section className="practice-status-panel practice-next-action">
          <p className="detail-label">Nuova revisione</p><h2>Il cliente ha richiesto modifiche.</h2><p>Prepara una nuova revisione del preventivo. La proposta precedente resterà nello storico.</p>
          <form action={createQuoteFromRequest}><input type="hidden" name="requestId" value={id} /><button type="submit">Crea nuova revisione</button></form>
        </section>
      )}

      {request.status === "quote_draft" && (
        <section className="practice-status-panel practice-next-action"><p className="detail-label">Preventivo in preparazione</p><p>La bozza è in lavorazione. Aprila per completare importi e condizioni.</p><Link className="practice-panel-link" href={`/area-riservata/pratiche/${id}/preventivo`}>Apri bozza →</Link></section>
      )}

      {request.status === "quote_published" && (
        <section className="practice-status-panel practice-next-action"><p className="detail-label">Preventivo inviato</p><p>La proposta è stata inviata al cliente. In attesa della sua risposta.</p></section>
      )}

      <div className="practice-detail-grid">
        <section className="practice-detail-card">
          <p className="detail-label">Cliente</p>
          <h2>{customerName}</h2>
          <dl className="detail-list customer-detail-list">
            <div><dt>Tipo cliente</dt><dd>{customerProfile?.customer_type === "business" ? "Partita IVA" : "Privato"}</dd></div>
            <div><dt>Email</dt><dd>{request.customer_email || customer?.email || "—"}</dd></div>
            <div><dt>Telefono</dt><dd>{customer?.phone || "—"}</dd></div>
            <div><dt>Indirizzo</dt><dd>{customerProfile?.address || "—"}</dd></div>
            {customerProfile?.customer_type === "business" ? (
              <>
                <div><dt>Partita IVA</dt><dd>{customerProfile.vat_number || "—"}</dd></div>
                <div><dt>PEC</dt><dd>{customerProfile.pec || "—"}</dd></div>
                <div><dt>Codice destinatario</dt><dd>{customerProfile.recipient_code || "—"}</dd></div>
              </>
            ) : (
              <div><dt>Codice fiscale</dt><dd>{customerProfile?.tax_code || "—"}</dd></div>
            )}
          </dl>
        </section>
        <section className="practice-detail-card">
          <p className="detail-label">Evento</p>
          <dl className="detail-list">
            <div><dt>Data inizio</dt><dd>{formatEventDate(request.event_date)}</dd></div>
            <div><dt>Data fine</dt><dd>{formatEventDate(request.event_end_date)}</dd></div>
          </dl>
        </section>
        <section className="practice-detail-card">
          <p className="detail-label">Location</p>
          <h2>{request.venue_name}</h2>
          <p>{request.venue_address}</p>
        </section>
        <section className="practice-detail-card">
          <p className="detail-label">Logistica</p>
          <dl className="detail-list">
            <div><dt>Consegna</dt><dd>{responsibilityLabel(request.delivery_responsibility)}</dd></div>
            <div><dt>Ritiro</dt><dd>{responsibilityLabel(request.pickup_responsibility)}</dd></div>
          </dl>
        </section>
        {request.customer_notes && (
          <section className="practice-detail-card practice-detail-notes">
            <p className="detail-label">Note del cliente</p>
            <p>{request.customer_notes}</p>
          </section>
        )}
      </div>

      <section className="practice-log">
        <div className="practice-log-heading">
          <div>
            <p className="detail-label">Registro attività</p>
            <h2>Storia della pratica</h2>
          </div>
          <span>{history.length + 1} eventi</span>
        </div>
        <ol className="practice-log-list">
          {history.map((entry) => (
            <li key={entry.id}>
              <span className="practice-log-marker" aria-hidden="true" />
              <div className="practice-log-content">
                <div className="practice-log-top">
                  <strong>
                    Stato modificato: {requestStatusLabel(entry.previous_status ?? "received")} →{" "}
                    {requestStatusLabel(entry.new_status)}
                  </strong>
                  <time dateTime={entry.created_at}>
                    {formatRomeDateTime(entry.created_at)}
                  </time>
                </div>
                <p>
                  Modifica effettuata da{" "}
                  <strong>{actorNames.get(entry.changed_by) ?? "Utente staff"}</strong>.
                </p>
                {entry.note && <blockquote>{entry.note}</blockquote>}
              </div>
            </li>
          ))}
          <li>
            <span className="practice-log-marker" aria-hidden="true" />
            <div className="practice-log-content">
              <div className="practice-log-top">
                <strong>Richiesta creata</strong>
                <time dateTime={request.created_at}>
                  {formatRomeDateTime(request.created_at)}
                </time>
              </div>
              <p>
                Richiesta inviata da <strong>{customerName}</strong>.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
}
