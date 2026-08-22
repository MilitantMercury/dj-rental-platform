"use client";

import { useState, type FormEvent } from "react";
import { confirmRequest } from "@/app/area-riservata/pratiche/actions";

type ConfirmPracticeFormProps = {
  requestId: string;
  outstandingDepositCents: number;
  defaultRecordedOn: string;
};

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export function ConfirmPracticeForm({ requestId, outstandingDepositCents, defaultRecordedOn }: ConfirmPracticeFormProps) {
  const [registerDeposit, setRegisterDeposit] = useState(false);
  const needsDeposit = outstandingDepositCents > 0;

  const confirmSubmission = (event: FormEvent<HTMLFormElement>) => {
    const action = registerDeposit
      ? `Confermi di registrare ${euro.format(outstandingDepositCents / 100)} come cauzione ricevuta e confermare definitivamente la pratica?`
      : "Confermi definitivamente la pratica?";
    if (!window.confirm(action)) event.preventDefault();
  };

  return (
    <section className="practice-status-panel practice-confirmation-panel">
      <p className="detail-label">Passaggio operativo</p>
      <h2>Conferma definitiva</h2>
      <p>
        {needsDeposit
          ? `Mancano ${euro.format(outstandingDepositCents / 100)} di cauzione registrata. Puoi annotarla qui contestualmente alla conferma.`
          : "La cauzione prevista risulta già coperta. Verrà verificata anche la disponibilità del materiale."}
      </p>
      <form action={confirmRequest} className="practice-lifecycle-form" onSubmit={confirmSubmission}>
        <input type="hidden" name="requestId" value={requestId} />
        {needsDeposit && (
          <>
            <label className="confirm-deposit-check">
              <input type="checkbox" name="registerDeposit" checked={registerDeposit} onChange={(event) => setRegisterDeposit(event.target.checked)} />
              <span>Ho ricevuto la cauzione di {euro.format(outstandingDepositCents / 100)}</span>
            </label>
            {registerDeposit && (
              <div className="confirm-deposit-fields">
                <label>Data di incasso<input name="depositRecordedOn" type="date" required defaultValue={defaultRecordedOn} /></label>
                <label>Metodo<input name="depositPaymentMethod" maxLength={80} required placeholder="Es. bonifico, contanti" /></label>
                <label>Nota interna<textarea name="depositInternalNotes" rows={2} maxLength={2000} placeholder="Facoltativa" /></label>
              </div>
            )}
          </>
        )}
        <label>Nota di conferma<textarea name="note" rows={2} placeholder="Facoltativa: dettagli della conferma." /></label>
        <button type="submit" disabled={needsDeposit && !registerDeposit}>
          {registerDeposit ? "Registra cauzione e conferma" : "Conferma pratica"} →
        </button>
      </form>
    </section>
  );
}
