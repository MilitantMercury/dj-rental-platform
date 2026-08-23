import Link from "next/link";
import { redirect } from "next/navigation";
import { customerDisplayName } from "@/lib/customer-name";
import { formatEventDateTime } from "@/lib/date-time";
import {
  ARCHIVED_REQUEST_STATUSES,
  isArchivedRequestStatus,
  requestStatusLabel,
  requestStatusTone,
} from "@/lib/request-status";
import { createClient } from "@/lib/supabase/server";
import { PracticesToolbar } from "@/components/practices-toolbar";
import { AppMessage } from "@/components/app-message";
import { expireDueOptions } from "./actions";

export const dynamic = "force-dynamic";

export default async function PracticesPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; stato?: string; message?: string }>;
}) {
  const { vista, stato, message } = await searchParams;
  const isArchiveView = vista === "archivio";
  const archiveFilter = ARCHIVED_REQUEST_STATUSES.includes(
    stato as (typeof ARCHIVED_REQUEST_STATUSES)[number],
  )
    ? stato
    : undefined;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff) redirect("/area-riservata");

  const { data: requests } = await supabase
    .from("requests")
    .select(
      "id,request_code,status,event_type,event_start_at,event_end_at,venue_name,venue_address,logistics_mode,customer_user_id,customer_email",
    )
    .order("created_at", { ascending: false });

  const allRequests = requests ?? [];
  const activeRequests = allRequests.filter(
    (request) => !isArchivedRequestStatus(request.status),
  );
  const archivedRequests = allRequests.filter((request) =>
    isArchivedRequestStatus(request.status),
  );
  const visibleRequests = isArchiveView
    ? archiveFilter
      ? archivedRequests.filter((request) => request.status === archiveFilter)
      : archivedRequests
    : activeRequests;

  const customerIds = [
    ...new Set(visibleRequests.map((request) => request.customer_user_id)),
  ];
  const [profilesResult, customerProfilesResult] = customerIds.length
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("user_id,first_name,last_name")
          .in("user_id", customerIds),
        supabase
          .from("customer_profiles")
          .select("user_id,customer_type,company_name")
          .in("user_id", customerIds),
      ])
    : [{ data: [] }, { data: [] }];

  const profiles = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.user_id, profile]),
  );
  const customerProfiles = new Map(
    (customerProfilesResult.data ?? []).map((profile) => [profile.user_id, profile]),
  );

  return (
    <main className="dashboard shell practices-page">
      <Link href="/area-riservata">← Area riservata</Link>
      <div className="practices-header">
        <div>
          <p className="eyebrow dark">Back-office</p>
          <h1>Pratiche ricevute.</h1>
        </div>
        <div className="practices-count">
          <strong>{allRequests.length}</strong> richieste totali
        </div>
      </div>
      {message && <AppMessage message={message.startsWith("opzioni-aggiornate-") ? `${message.replace("opzioni-aggiornate-", "")} opzioni scadute aggiornate.` : message} />}
      <PracticesToolbar
        activeCount={activeRequests.length}
        archivedCount={archivedRequests.length}
        isArchiveView={isArchiveView}
        expireAction={staff.role === "owner" ? expireDueOptions : undefined}
      />
      {isArchiveView && (
        <nav className="practice-archive-filters" aria-label="Filtra archivio">
          <Link
            className={!archiveFilter ? "is-active" : undefined}
            href="/area-riservata/pratiche?vista=archivio"
          >
            Tutte
          </Link>
          {ARCHIVED_REQUEST_STATUSES.map((status) => (
            <Link
              className={archiveFilter === status ? "is-active" : undefined}
              href={`/area-riservata/pratiche?vista=archivio&stato=${status}`}
              key={status}
            >
              {requestStatusLabel(status)}
            </Link>
          ))}
        </nav>
      )}
      <div className="practice-list">
        {visibleRequests.map((request) => {
          const customerName = customerDisplayName(
            profiles.get(request.customer_user_id),
            customerProfiles.get(request.customer_user_id),
            request.customer_email || "Cliente non disponibile",
          );

          return (
            <article className="practice-card" key={request.id}>
              <div className="practice-card-top">
                <span className="card-kicker">{request.request_code}</span>
                <strong className={`status-badge status-badge--${requestStatusTone(request.status)}`}>
                  {requestStatusLabel(request.status)}
                </strong>
              </div>
              <h2>{request.event_type}</h2>
              <div className="practice-customer">
                <span>Cliente</span>
                <strong>{customerName}</strong>
              </div>
              <p>
                {formatEventDateTime(request.event_start_at)} →{" "}
                {formatEventDateTime(request.event_end_at)}
                <br />
                <strong>{request.venue_name}</strong>
                <br />
                {request.venue_address}
              </p>
              <div className="practice-card-bottom">
                <span>
                  {request.logistics_mode === "delivery"
                    ? "Consegna"
                    : "Ritiro in sede"}
                </span>
                <Link href={`/area-riservata/pratiche/${request.id}`}>
                  Apri dettaglio →
                </Link>
              </div>
            </article>
          );
        })}
        {!visibleRequests.length && (
          <section className="practice-list-empty">
            <h2>{isArchiveView ? "Archivio vuoto." : "Nessuna pratica da gestire."}</h2>
            <p>
              {isArchiveView
                ? "Non ci sono pratiche corrispondenti al filtro selezionato."
                : "Le nuove richieste e le pratiche operative appariranno qui."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
