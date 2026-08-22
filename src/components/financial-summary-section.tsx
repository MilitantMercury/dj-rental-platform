type FinancialSummarySectionProps = {
  quoteTotalCents: number;
  cashCollectedCents: number;
  rentalOutstandingCents: number;
  depositToReturnCents: number;
};

export function FinancialSummarySection({ quoteTotalCents, cashCollectedCents, rentalOutstandingCents, depositToReturnCents }: FinancialSummarySectionProps) {
  const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
  return (
    <section className="practice-status-panel financial-summary-section">
      <p className="detail-label">Riepilogo economico</p>
      <h2>Situazione della pratica</h2>
      <dl className="financial-summary">
        <div><dt>Incassato</dt><dd>{euro.format(cashCollectedCents / 100)}</dd><small>Inclusi acconti e cauzione</small></div>
        <div><dt>Da ricevere</dt><dd>{euro.format(rentalOutstandingCents / 100)}</dd><small>Totale preventivo: {euro.format(quoteTotalCents / 100)}</small></div>
        <div><dt>Da restituire</dt><dd>{euro.format(depositToReturnCents / 100)}</dd><small>Cauzione netta</small></div>
      </dl>
    </section>
  );
}
