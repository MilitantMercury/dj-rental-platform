import Link from "next/link";

type PracticesToolbarProps = {
  activeCount: number;
  archivedCount: number;
  isArchiveView: boolean;
  expireAction?: () => Promise<void>;
};

export function PracticesToolbar({
  activeCount,
  archivedCount,
  isArchiveView,
  expireAction,
}: PracticesToolbarProps) {
  return (
    <section className="practices-toolbar" aria-label="Strumenti pratiche">
      {expireAction && (
        <div className="practices-maintenance">
          <div>
            <strong>Scadenze opzioni</strong>
            <span>Allinea le opzioni che hanno superato la scadenza.</span>
          </div>
          <form action={expireAction}>
            <button className="practices-maintenance-button" type="submit">
              Aggiorna opzioni scadute
            </button>
          </form>
        </div>
      )}

      <nav className="practice-view-tabs" aria-label="Viste delle pratiche">
        <Link
          className={!isArchiveView ? "is-active" : undefined}
          href="/area-riservata/pratiche"
          aria-current={!isArchiveView ? "page" : undefined}
        >
          Da gestire <span>{activeCount}</span>
        </Link>
        <Link
          className={isArchiveView ? "is-active" : undefined}
          href="/area-riservata/pratiche?vista=archivio"
          aria-current={isArchiveView ? "page" : undefined}
        >
          Archivio <span>{archivedCount}</span>
        </Link>
      </nav>
    </section>
  );
}
