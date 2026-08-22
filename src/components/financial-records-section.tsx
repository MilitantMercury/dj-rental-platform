import { addFinancialRecord } from "@/app/area-riservata/pratiche/actions";
import { CurrencyInput } from "@/components/currency-input";
import { formatEventDate } from "@/lib/date-time";
import { financialRecordLabel } from "@/lib/financial-records";

type FinancialRecord = {
  id: string;
  record_type: string;
  amount_cents: number;
  recorded_on: string;
  payment_method: string | null;
  internal_notes: string | null;
};

export function FinancialRecordsSection({ requestId, records, defaultRecordedOn }: { requestId: string; records: FinancialRecord[]; defaultRecordedOn: string }) {
  const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
  return (
    <section className="practice-status-panel practice-financial-records" id="movimenti-economici">
      <div>
        <p className="detail-label">Economia · solo owner</p>
        <h2>Movimenti economici</h2>
        <p>Registra gli importi effettivamente incassati o restituiti. Queste informazioni sono interne e non vengono mostrate al cliente.</p>
      </div>
      {records.length > 0 ? (
        <ul className="financial-record-list">
          {records.map((record) => (
            <li key={record.id}>
              <div><strong>{financialRecordLabel(record.record_type)}</strong><span>{formatEventDate(record.recorded_on)}{record.payment_method ? ` · ${record.payment_method}` : ""}</span>{record.internal_notes && <small>{record.internal_notes}</small>}</div>
              <strong>{euro.format(record.amount_cents / 100)}</strong>
            </li>
          ))}
        </ul>
      ) : <p className="financial-record-empty">Nessun movimento registrato.</p>}
      <details className="financial-record-entry">
        <summary>Registra movimento <span aria-hidden="true">+</span></summary>
        <form action={addFinancialRecord} className="financial-record-form">
          <input type="hidden" name="requestId" value={requestId} />
          <label className="financial-record-type">Tipo<select name="recordType" required defaultValue=""><option value="" disabled>Seleziona movimento</option><option value="deposit_received">Cauzione incassata</option><option value="deposit_returned">Cauzione restituita</option><option value="advance_received">Acconto incassato</option><option value="balance_received">Saldo incassato</option><option value="adjustment">Rettifica</option></select></label>
          <label className="financial-record-amount">Importo (€)<CurrencyInput name="amount" initialCents={0} required /></label>
          <label className="financial-record-date">Data<input name="recordedOn" type="date" required defaultValue={defaultRecordedOn} /></label>
          <label className="financial-record-method">Metodo<input name="paymentMethod" maxLength={80} placeholder="Es. bonifico, contanti" /></label>
          <label className="financial-record-notes">Nota interna<textarea name="internalNotes" rows={3} maxLength={2000} /></label>
          <button className="financial-record-action" type="submit">Registra movimento</button>
        </form>
      </details>
    </section>
  );
}
