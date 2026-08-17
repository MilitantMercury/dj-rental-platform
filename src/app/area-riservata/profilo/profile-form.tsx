"use client";

import { useState } from "react";
import { updateCustomerProfile, updateStaffProfile } from "./actions";

type CustomerProfileValues = {
  customerType: "private" | "business";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  pec: string;
  recipientCode: string;
};

export function CustomerProfileForm({ initial }: { initial: CustomerProfileValues }) {
  const [customerType, setCustomerType] = useState(initial.customerType);
  const [pec, setPec] = useState(initial.pec);
  const [recipientCode, setRecipientCode] = useState(initial.recipientCode);

  return (
    <form action={updateCustomerProfile} className="profile-form">
      <section className="profile-form-section">
        <div className="profile-section-heading">
          <span>01</span>
          <div>
            <h2>Identità</h2>
            <p>I dati con cui verrai identificato nelle richieste.</p>
          </div>
        </div>
        <div className="profile-fields">
          <label className="profile-field-full">
            Tipo cliente
            <select
              name="customerType"
              value={customerType}
              onChange={(event) => setCustomerType(event.target.value as "private" | "business")}
              required
            >
              <option value="private">Privato</option>
              <option value="business">Partita IVA</option>
            </select>
          </label>
          {customerType === "private" ? (
            <>
              <label>Nome<input name="firstName" defaultValue={initial.firstName} maxLength={100} required /></label>
              <label>Cognome<input name="lastName" defaultValue={initial.lastName} maxLength={100} required /></label>
              <label className="profile-field-full">Codice fiscale<input name="taxCode" defaultValue={initial.taxCode} maxLength={32} required /></label>
            </>
          ) : (
            <>
              <label className="profile-field-full">Ragione sociale<input name="companyName" defaultValue={initial.companyName} maxLength={160} required /></label>
              <label className="profile-field-full">Partita IVA<input name="vatNumber" defaultValue={initial.vatNumber} maxLength={32} required /></label>
            </>
          )}
        </div>
      </section>

      <section className="profile-form-section">
        <div className="profile-section-heading">
          <span>02</span>
          <div>
            <h2>Contatti</h2>
            <p>Recapiti utilizzati dal gestore per la pratica.</p>
          </div>
        </div>
        <div className="profile-fields">
          <label>Email<input type="email" value={initial.email} readOnly aria-readonly="true" /></label>
          <label>Telefono<input name="phone" type="tel" defaultValue={initial.phone} minLength={6} maxLength={30} required /></label>
          <label className="profile-field-full">Indirizzo<input name="address" defaultValue={initial.address} maxLength={300} required /></label>
          {customerType === "business" && (
            <>
              <label>PEC<input name="pec" type="email" defaultValue={initial.pec} maxLength={320} onInput={(event) => setPec(event.currentTarget.value)} required={!recipientCode} /></label>
              <label>Codice destinatario<input name="recipientCode" defaultValue={initial.recipientCode} maxLength={16} onInput={(event) => setRecipientCode(event.currentTarget.value)} required={!pec} /></label>
              <small className="profile-field-full">Inserisci almeno uno tra PEC e codice destinatario.</small>
            </>
          )}
        </div>
      </section>

      <div className="profile-form-footer">
        <p>L’email di accesso non può essere modificata da questa pagina.</p>
        <button type="submit">Salva modifiche</button>
      </div>
    </form>
  );
}

export function StaffProfileForm({
  initial,
}: {
  initial: {
    displayName: string;
    email: string;
    phone: string;
    canEditDisplayName: boolean;
  };
}) {
  return (
    <form action={updateStaffProfile} className="profile-form">
      <section className="profile-form-section">
        <div className="profile-section-heading">
          <span>01</span>
          <div>
            <h2>Account staff</h2>
            <p>I recapiti e il nome mostrato nell’area di gestione.</p>
          </div>
        </div>
        <div className="profile-fields">
          <label className="profile-field-full">
            Nome visualizzato
            <input
              name="displayName"
              defaultValue={initial.displayName}
              maxLength={100}
              readOnly={!initial.canEditDisplayName}
              required
            />
          </label>
          <label>
            Email
            <input type="email" value={initial.email} readOnly aria-readonly="true" />
          </label>
          <label>
            Telefono
            <input name="phone" type="tel" defaultValue={initial.phone} maxLength={30} />
          </label>
        </div>
      </section>
      <div className="profile-form-footer">
        <p>L’email e i permessi del ruolo non possono essere modificati da questa pagina.</p>
        <button type="submit">Salva modifiche</button>
      </div>
    </form>
  );
}
