import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEventDateTime, formatRomeDateTime, formatRomeLongDate } from "@/lib/date-time";
import { requestStatusDescription, requestStatusLabel, requestStatusTone } from "@/lib/request-status";
import { ownerStatusTransitions } from "@/lib/request-lifecycle";
import { ConfirmPracticeForm } from "@/components/confirm-practice-form";
import { FinancialRecordsSection } from "@/components/financial-records-section";
import { FinancialSummarySection } from "@/components/financial-summary-section";
import { calculateFinancialSummary } from "@/lib/financial-summary";
import { createClient } from "@/lib/supabase/server";
import { addExternalSupply, assignCollaborator, closeRequest, confirmRequest, createQuoteFromRequest, markRequestAwaitingDeposit, placeOnOption, registerDelivery, registerReturn, startPreparation, updateRequestStatus } from "../actions";

export const dynamic = "force-dynamic";

const responsibilityLabel = (value: string) =>
  value === "owner" ? "A carico del gestore" : "A carico del cliente";

const quoteResponseLabel = (outcome: string) =>
  outcome === "changes_requested"
    ? "Richiesta di modifiche"
    : outcome === "rejected"
      ? "Motivo del rifiuto"
      : "Messaggio sulla proposta";

export default async function PracticeDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; conflitti?: string }>;
}) {
  const { id } = await params;
  const { message, conflitti } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: currentStaff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (currentStaff?.role !== "owner") redirect("/area-riservata");

  const { data: request } = await supabase
    .from("requests")
    .select(
      "request_code,status,event_type,event_start_at,event_end_at,venue_name,venue_address,delivery_responsibility,pickup_responsibility,customer_notes,created_at,customer_user_id,customer_email",
    )
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const [customerResult, customerProfileResult, itemsResult, historyResult, quoteResult, externalSupplyResult, financialRecordsResult, collaboratorsResult, assignmentsResult] =
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
      .select("id,item_id,item_type,description,quantity")
      .eq("request_id", id)
      .order("created_at"),
    supabase
      .from("request_status_history")
      .select("id,previous_status,new_status,note,changed_by,created_at")
      .eq("request_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotes")
      .select("id,current_revision_id")
      .eq("request_id", id)
      .maybeSingle(),
    supabase.from("external_supplies").select("id,product_id,supplier_name,quantity,status,internal_notes").eq("request_id", id).order("created_at", { ascending: false }),
    supabase.from("financial_records").select("id,record_type,amount_cents,recorded_on,payment_method,internal_notes,created_at").eq("request_id", id).order("recorded_on", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("staff_profiles").select("user_id,display_name").eq("role", "collaborator").eq("active", true).order("display_name"),
    supabase.from("request_assignments").select("id,staff_user_id,operational_role").eq("request_id", id),
    ]);

  const customer = customerResult.data;
  const customerProfile = customerProfileResult.data;
  const items = itemsResult.data ?? [];
  const history = historyResult.data ?? [];
  const externalSupplies = externalSupplyResult.data ?? [];
  const financialRecords = financialRecordsResult.data ?? [];
  const collaborators = collaboratorsResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const collaboratorNames = new Map(collaborators.map((collaborator) => [collaborator.user_id, collaborator.display_name]));
  const hasPublishedQuote = Boolean(quoteResult.data?.current_revision_id);
  const canManageFinancialRecords = hasPublishedQuote || financialRecords.length > 0 || [
    "awaiting_deposit",
    "confirmed",
    "preparing",
    "delivered_or_collected",
    "returned",
    "closed",
  ].includes(request.status);
  const { data: currentRevision } = quoteResult.data?.current_revision_id
    ? await supabase.from("quote_revisions").select("deposit_cents,total_cents").eq("id", quoteResult.data.current_revision_id).maybeSingle()
    : { data: null };
  const { data: quoteRevisions } = quoteResult.data?.id
    ? await supabase
        .from("quote_revisions")
        .select("id,revision_number")
        .eq("quote_id", quoteResult.data.id)
    : { data: [] };
  const quoteRevisionIds = (quoteRevisions ?? []).map((revision) => revision.id);
  const revisionNumbers = new Map(
    (quoteRevisions ?? []).map((revision) => [revision.id, revision.revision_number]),
  );
  const { data: quoteResponses } = quoteRevisionIds.length
    ? await supabase
        .from("quote_responses")
        .select("revision_id,outcome,comment,created_at")
        .eq("customer_user_id", request.customer_user_id)
        .in("revision_id", quoteRevisionIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const customerQuoteMessages = (quoteResponses ?? []).filter(
    (response) => response.comment,
  );
  const requiredDepositCents = currentRevision?.deposit_cents ?? 0;
  const collectedDepositCents = financialRecords.reduce((total, record) => total + (record.record_type === "deposit_received" ? record.amount_cents : record.record_type === "deposit_returned" ? -record.amount_cents : 0), 0);
  const financialSummary = calculateFinancialSummary(currentRevision?.total_cents ?? 0, financialRecords);
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
  const conflicts = (() => { try { return conflitti ? JSON.parse(conflitti) as Array<{ product_id?: string; requested_quantity?: number; available_quantity?: number }> : []; } catch { return []; } })();
  const suggestedSupply = conflicts.length === 1 && conflicts[0]?.product_id
    ? {
      productId: conflicts[0].product_id,
      quantity: Math.max((conflicts[0].requested_quantity ?? 1) - (conflicts[0].available_quantity ?? 0), 1),
    }
    : null;
  const services = items.filter((item) => item.item_type === "service");
  const customerName = customerProfile?.customer_type === "business"
    ? customerProfile.company_name || "Azienda non disponibile"
    : customer
      ? `${customer.first_name} ${customer.last_name}`.trim()
      : "Profilo non disponibile";
  const transitions = ownerStatusTransitions(request.status);
  const standardTransitions = transitions;
  const lifecycleAction = request.status === "accepted" && requiredDepositCents > 0
    ? {
      label: "Richiedi caparra",
      title: "Passa in attesa caparra",
      text: `Il cliente ha accettato il preventivo. La caparra prevista è ${new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(requiredDepositCents / 100)}: registrala nella sezione Economia prima della conferma definitiva.`,
      noteLabel: "Nota interna",
      notePlaceholder: "Facoltativa: istruzioni o accordi sulla caparra.",
      action: markRequestAwaitingDeposit,
    }
    : request.status === "accepted"
    ? {
      label: "Conferma pratica",
      title: "Conferma definitiva",
      text: "Il cliente ha accettato il preventivo. Dopo la verifica operativa, conferma definitivamente la pratica.",
      noteLabel: "Nota di conferma",
      notePlaceholder: "Facoltativa: dettagli della conferma.",
      action: confirmRequest,
    }
    : null;
  const feedback =
    message === "stato-aggiornato"
      ? "Stato aggiornato."
      : message === "preventivo-creato"
        ? "Bozza preventivo creata."
        : message === "disponibilita-insufficiente"
          ? "La pratica non è stata confermata: il materiale richiesto non è attualmente coperto dalla disponibilità."
        : message === "fornitura-salvata"
          ? "Copertura esterna registrata. Se è confermata, sarà considerata nel prossimo controllo di disponibilità."
          : message === "fornitura-non-salvata"
            ? "Non è stato possibile registrare la copertura esterna. Riprova."
            : message === "fornitura-non-valida"
              ? "Completa correttamente prodotto, fornitore, quantità e stato della copertura esterna."
      : message === "caparra-non-registrata"
          ? "La pratica non può essere confermata: registra prima la cauzione effettivamente ricevuta nella sezione Movimenti economici."
        : message === "pratica-confermata-cauzione-registrata"
          ? "Cauzione registrata e pratica confermata definitivamente."
          : message === "cauzione-non-valida"
            ? "Indica data e metodo di incasso della cauzione."
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
          <strong className={`status-badge status-badge--${requestStatusTone(request.status)}`}>
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

      <div className="practice-workspace">
      <div className="practice-workspace-main">
      {(request.customer_notes || customerQuoteMessages.length > 0) && (
        <section className="customer-messages">
          <div className="customer-messages-heading">
            <div>
              <p className="detail-label">Comunicazioni</p>
              <h2>Messaggi del cliente</h2>
            </div>
            <span>{Number(Boolean(request.customer_notes)) + customerQuoteMessages.length}</span>
          </div>
          <div className="customer-messages-list">
            {customerQuoteMessages.map((response) => (
              <article key={`${response.revision_id}-${response.created_at}`}>
                <div>
                  <p className="detail-label">
                    {quoteResponseLabel(response.outcome)} · Revisione {revisionNumbers.get(response.revision_id) ?? "—"}
                  </p>
                  <time dateTime={response.created_at}>
                    {formatRomeDateTime(response.created_at)}
                  </time>
                </div>
                <p>{response.comment}</p>
              </article>
            ))}
            {request.customer_notes && (
              <article>
                <div>
                  <p className="detail-label">Nota alla richiesta</p>
                  <time dateTime={request.created_at}>
                    {formatRomeDateTime(request.created_at)}
                  </time>
                </div>
                <p>{request.customer_notes}</p>
              </article>
            )}
          </div>
        </section>
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

      <div className="practice-detail-grid">
        <section className="practice-detail-card">
          <p className="detail-label">Cliente</p>
          <h2>{customerName}</h2>
          <dl className="detail-list customer-detail-list">
            <div><dt>Tipo cliente</dt><dd>{customerProfile?.customer_type === "business" ? "Partita IVA" : "Privato"}</dd></div>
            <div><dt>Email</dt><dd>{request.customer_email || customer?.email || "—"}</dd></div>
            <div><dt>Telefono</dt><dd>{customer?.phone || "—"}</dd></div>
            <div><dt>Indirizzo</dt><dd>{customerProfile?.address || "—"}</dd></div>
            {customerProfile?.customer_type === "business" ? <><div><dt>Partita IVA</dt><dd>{customerProfile.vat_number || "—"}</dd></div><div><dt>PEC</dt><dd>{customerProfile.pec || "—"}</dd></div><div><dt>Codice destinatario</dt><dd>{customerProfile.recipient_code || "—"}</dd></div></> : <div><dt>Codice fiscale</dt><dd>{customerProfile?.tax_code || "—"}</dd></div>}
          </dl>
        </section>
        <section className="practice-detail-card"><p className="detail-label">Evento</p><dl className="detail-list"><div><dt>Inizio</dt><dd>{formatEventDateTime(request.event_start_at)}</dd></div><div><dt>Fine</dt><dd>{formatEventDateTime(request.event_end_at)}</dd></div></dl></section>
        <section className="practice-detail-card"><p className="detail-label">Location</p><h2>{request.venue_name}</h2><p>{request.venue_address}</p></section>
        <section className="practice-detail-card"><p className="detail-label">Logistica</p><dl className="detail-list"><div><dt>Consegna</dt><dd>{responsibilityLabel(request.delivery_responsibility)}</dd></div><div><dt>Ritiro</dt><dd>{responsibilityLabel(request.pickup_responsibility)}</dd></div></dl></section>
      </div>

      <section className="practice-log">
        <div className="practice-log-heading"><div><p className="detail-label">Registro attività</p><h2>Storia della pratica</h2></div><span>{history.length + 1} eventi</span></div>
        <ol className="practice-log-list">
          {history.map((entry) => <li key={entry.id}><span className="practice-log-marker" aria-hidden="true" /><div className="practice-log-content"><div className="practice-log-top"><strong>Stato modificato: {requestStatusLabel(entry.previous_status ?? "received")} → {requestStatusLabel(entry.new_status)}</strong><time dateTime={entry.created_at}>{formatRomeDateTime(entry.created_at)}</time></div><p>Modifica effettuata da <strong>{actorNames.get(entry.changed_by) ?? "Utente staff"}</strong>.</p>{entry.note && <blockquote>{entry.note}</blockquote>}</div></li>)}
          <li><span className="practice-log-marker" aria-hidden="true" /><div className="practice-log-content"><div className="practice-log-top"><strong>Richiesta creata</strong><time dateTime={request.created_at}>{formatRomeDateTime(request.created_at)}</time></div><p>Richiesta inviata da <strong>{customerName}</strong>.</p></div></li>
        </ol>
      </section>

      </div>
      <aside className="practice-workspace-actions" aria-label="Azioni della pratica">
      {request.status === "awaiting_deposit" && (
        <div className="confirmation-financial-area">
          <ConfirmPracticeForm requestId={id} outstandingDepositCents={Math.max(requiredDepositCents - collectedDepositCents, 0)} defaultRecordedOn={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" })} />
          <FinancialSummarySection quoteTotalCents={currentRevision?.total_cents ?? 0} {...financialSummary} />
          <FinancialRecordsSection requestId={id} records={financialRecords} defaultRecordedOn={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" })} />
        </div>
      )}

      {standardTransitions.length ? (
        <section className="practice-status-panel">
          <p className="detail-label">Gestione pratica</p>
          <form action={updateRequestStatus}>
            <input type="hidden" name="requestId" value={id} />
            <input type="hidden" name="currentStatus" value={request.status} />
            <label>
              Nuovo stato
              <select name="status" required defaultValue="">
                <option value="" disabled>Seleziona un’azione</option>
                {standardTransitions.map((status) => <option key={status} value={status}>{requestStatusLabel(status)}</option>)}
              </select>
            </label>
            <label>Nota interna<textarea name="note" rows={2} placeholder="Facoltativa" /></label>
            <button type="submit">Aggiorna stato</button>
          </form>
        </section>
      ) : null}

      {lifecycleAction && (
        <section className="practice-status-panel practice-lifecycle-action">
          <div>
            <p className="detail-label">Passaggio operativo</p>
            <h2>{lifecycleAction.title}</h2>
            <p>{lifecycleAction.text}</p>
          </div>
          <form action={lifecycleAction.action} className="practice-lifecycle-form">
            <input type="hidden" name="requestId" value={id} />
            <label>
              {lifecycleAction.noteLabel}
              <textarea name="note" rows={2} placeholder={lifecycleAction.notePlaceholder} />
            </label>
            <button type="submit">{lifecycleAction.label} →</button>
          </form>
        </section>
      )}

      {request.status === "confirmed" && (
        <section className="practice-status-panel practice-lifecycle-action">
          <div><p className="detail-label">Passaggio operativo</p><h2>Avvia preparazione</h2><p>Crea la checklist del materiale da preparare, poi assegnala ai collaboratori operativi se necessario.</p></div>
          <form action={startPreparation} className="practice-lifecycle-form"><input type="hidden" name="requestId" value={id}/><label>Nota di avvio<textarea name="note" rows={2} placeholder="Facoltativa" /></label><button type="submit">Apri checklist →</button></form>
        </section>
      )}

      {["confirmed", "preparing"].includes(request.status) && (
        <section className="practice-status-panel practice-assignment-panel"><div><p className="detail-label">Squadra operativa · solo owner</p><h2>Collaboratori assegnati</h2><p>Gli assegnati possono aggiornare la checklist della pratica, senza prezzi o dati economici.</p></div>{assignments.length > 0 && <ul>{assignments.map((assignment) => <li key={assignment.id}><strong>{collaboratorNames.get(assignment.staff_user_id) ?? "Collaboratore"}</strong><span>{assignment.operational_role === "lead" ? "Referente" : "Operatore"}</span></li>)}</ul>}<form action={assignCollaborator} className="assignment-form"><input type="hidden" name="requestId" value={id}/><label>Collaboratore<select name="staffUserId" required defaultValue=""><option value="" disabled>Seleziona collaboratore</option>{collaborators.map((collaborator) => <option key={collaborator.user_id} value={collaborator.user_id}>{collaborator.display_name}</option>)}</select></label><label>Ruolo<select name="operationalRole" defaultValue="operator"><option value="operator">Operatore</option><option value="lead">Referente</option></select></label><button type="submit">Assegna</button></form></section>
      )}

      {request.status === "preparing" && (
        <section className="practice-status-panel practice-lifecycle-action"><div><p className="detail-label">Preparazione in corso</p><h2>Registra consegna o ritiro</h2><p>Apri la checklist, verifica che ogni materiale sia pronto e registra l’affidamento al cliente.</p><Link className="practice-panel-link" href={`/area-riservata/pratiche/${id}/operativita`}>Apri checklist →</Link></div><form action={registerDelivery} className="practice-lifecycle-form"><input type="hidden" name="requestId" value={id}/><label>Nota di consegna<textarea name="note" rows={2} placeholder="Facoltativa" /></label><button type="submit">Registra consegna →</button></form></section>
      )}

      {request.status === "delivered_or_collected" && (
        <section className="practice-status-panel practice-lifecycle-action"><div><p className="detail-label">Materiale affidato</p><h2>Verifica il rientro</h2><p>Aggiorna nella checklist le quantità rientrate; potrai poi registrare il rientro completo della pratica.</p><Link className="practice-panel-link" href={`/area-riservata/pratiche/${id}/operativita`}>Apri checklist →</Link></div><form action={registerReturn} className="practice-lifecycle-form"><input type="hidden" name="requestId" value={id}/><label>Nota sul rientro<textarea name="note" rows={2} placeholder="Facoltativa" /></label><button type="submit">Registra rientro →</button></form></section>
      )}

      {request.status === "returned" && (
        <section className="practice-status-panel practice-lifecycle-action"><div><p className="detail-label">Verifiche finali</p><h2>Chiudi pratica</h2><p>Materiale rientrato. Dopo gli ultimi controlli operativi ed economici, archivia la pratica.</p></div><form action={closeRequest} className="practice-lifecycle-form"><input type="hidden" name="requestId" value={id}/><label>Nota di chiusura<textarea name="note" rows={2} placeholder="Facoltativa" /></label><button type="submit">Chiudi pratica →</button></form></section>
      )}

      {message === "disponibilita-insufficiente" && conflicts.length > 0 && (
        <section className="practice-status-panel practice-conflicts"><p className="detail-label">Disponibilità insufficiente · solo owner</p><h2>La pratica non può ancora essere confermata.</h2><p>La conferma non è stata completata e non è stata apportata alcuna modifica alla pratica. Copri il materiale mancante con giacenza interna o una fornitura esterna confermata.</p><ul>{conflicts.map((conflict, index) => <li key={`${conflict.product_id}-${index}`}><strong>{products.find((product) => product.item_id === conflict.product_id)?.description ?? "Prodotto"}</strong><span>Richiesti {conflict.requested_quantity ?? 0} · disponibili {conflict.available_quantity ?? 0}</span></li>)}</ul></section>
      )}

      {["accepted", "awaiting_deposit"].includes(request.status) && products.length > 0 && (
        <section className="practice-status-panel practice-external-supply">
          <div><p className="detail-label">Copertura esterna · solo owner</p><h2>Materiale da fornitore terzo</h2><p>Questi dati sono interni e non vengono mai mostrati al cliente. Solo le coperture confermate contano nella verifica di disponibilità.</p></div>
          {externalSupplies.length > 0 && <ul className="external-supply-list">{externalSupplies.map((supply) => <li key={supply.id}><strong>{products.find((product) => product.item_id === supply.product_id)?.description ?? "Prodotto"} × {supply.quantity}</strong><span>{supply.supplier_name} · {supply.status === "confirmed" ? "Confermata" : "Da richiedere"}</span>{supply.internal_notes && <small>{supply.internal_notes}</small>}</li>)}</ul>}
          <form action={addExternalSupply} className="external-supply-form"><input type="hidden" name="requestId" value={id}/><label>Prodotto<select name="productId" required defaultValue={suggestedSupply?.productId ?? ""}><option value="" disabled>Seleziona prodotto</option>{products.map((product) => <option key={product.item_id} value={product.item_id}>{product.description}</option>)}</select></label><label>Fornitore<input name="supplierName" required maxLength={160}/></label><label>Quantità<input name="quantity" type="number" min="1" step="1" required defaultValue={suggestedSupply?.quantity}/></label><label>Stato<select name="status" defaultValue="requested"><option value="requested">Da richiedere</option><option value="confirmed">Confermata</option></select></label><label>Nota interna<textarea name="internalNotes" rows={2} maxLength={2000}/></label><button type="submit">Registra fornitura</button></form>
        </section>
      )}

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

      {hasPublishedQuote && (
        <section className="practice-status-panel practice-next-action">
          <div className="practice-next-action-row">
            <div>
              <p className="detail-label">Preventivo pubblicato</p>
              <p>{request.status === "quote_published" ? "La proposta è stata inviata al cliente. In attesa della sua risposta." : "Consulta la revisione pubblicata collegata a questa pratica."}</p>
            </div>
            <Link className="practice-panel-link practice-panel-link-inline" href={`/area-riservata/pratiche/${id}/preventivo`}>
              Rivedi preventivo →
            </Link>
          </div>
        </section>
      )}

      {canManageFinancialRecords && request.status !== "awaiting_deposit" && (
        <><FinancialSummarySection quoteTotalCents={currentRevision?.total_cents ?? 0} {...financialSummary} /><FinancialRecordsSection requestId={id} records={financialRecords} defaultRecordedOn={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" })} /></>
      )}

      {request.status === "quote_published" && (
        <section className="practice-status-panel practice-next-action"><p className="detail-label">Opzione temporanea</p><h2>Riserva il materiale per questa pratica.</h2><p>L’opzione blocca la disponibilità fino alla scadenza configurata in Magazzino. Il cliente non vede questa informazione.</p><form action={placeOnOption}><input type="hidden" name="requestId" value={id}/><label>Nota interna<textarea name="note" rows={2} placeholder="Facoltativa"/></label><button type="submit">Metti in opzione →</button></form></section>
      )}
      </aside>
      </div>

    </main>
  );
}
