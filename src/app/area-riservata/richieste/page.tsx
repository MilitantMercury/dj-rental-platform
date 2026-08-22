import Link from "next/link";
import { redirect } from "next/navigation";
import { formatEventDateTime } from "@/lib/date-time";
import {
  ARCHIVED_REQUEST_STATUSES,
  isArchivedRequestStatus,
  requestStatusLabel,
  requestStatusTone,
} from "@/lib/request-status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerRequests({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; stato?: string }>;
}) {
  const { vista, stato } = await searchParams;
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

  const { data: requests } = await supabase
    .from("requests")
    .select(
      "id,request_code,status,event_type,event_start_at,event_end_at,venue_name,venue_address",
    )
    .eq("customer_user_id", user.id)
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

  return (
    <main className="dashboard shell practices-page">
      <Link href="/area-riservata">← Area riservata</Link>
      <div className="practices-header">
        <div>
          <p className="eyebrow dark">Area cliente</p>
          <h1>Le tue richieste.</h1>
        </div>
        <div className="practices-count">
          <strong>{allRequests.length}</strong> richieste totali
        </div>
      </div>

      <nav className="practice-view-tabs" aria-label="Viste delle richieste">
        <Link
          className={!isArchiveView ? "is-active" : undefined}
          href="/area-riservata/richieste"
          aria-current={!isArchiveView ? "page" : undefined}
        >
          Da gestire <span>{activeRequests.length}</span>
        </Link>
        <Link
          className={isArchiveView ? "is-active" : undefined}
          href="/area-riservata/richieste?vista=archivio"
          aria-current={isArchiveView ? "page" : undefined}
        >
          Archivio <span>{archivedRequests.length}</span>
        </Link>
      </nav>

      {isArchiveView && (
        <nav className="practice-archive-filters" aria-label="Filtra archivio">
          <Link
            className={!archiveFilter ? "is-active" : undefined}
            href="/area-riservata/richieste?vista=archivio"
          >
            Tutte
          </Link>
          {ARCHIVED_REQUEST_STATUSES.map((status) => (
            <Link
              className={archiveFilter === status ? "is-active" : undefined}
              href={`/area-riservata/richieste?vista=archivio&stato=${status}`}
              key={status}
            >
              {requestStatusLabel(status)}
            </Link>
          ))}
        </nav>
      )}

      <div className="practice-list">
        {visibleRequests.map((request) => (
          <article className="practice-card" key={request.id}>
            <div className="practice-card-top">
              <span className="card-kicker">{request.request_code}</span>
              <strong
                className={`status-badge status-badge--${requestStatusTone(request.status)}`}
              >
                {requestStatusLabel(request.status)}
              </strong>
            </div>
            <h2>{request.event_type}</h2>
            <p>
              {formatEventDateTime(request.event_start_at)} →{" "}
              {formatEventDateTime(request.event_end_at)}
              <br />
              <strong>{request.venue_name}</strong>
              <br />
              {request.venue_address}
            </p>
            <div className="practice-card-bottom">
              <span>{isArchiveView ? "Pratica archiviata" : "Richiesta ricevuta"}</span>
              <Link href={`/area-riservata/richieste/${request.id}`}>
                Apri dettaglio →
              </Link>
            </div>
          </article>
        ))}
        {!visibleRequests.length && (
          <section className="practice-list-empty">
            <h2>{isArchiveView ? "Archivio vuoto." : "Nessuna richiesta da gestire."}</h2>
            <p>
              {isArchiveView
                ? "Non ci sono richieste corrispondenti al filtro selezionato."
                : "Le richieste in corso appariranno qui."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
