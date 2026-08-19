"use client";

import { useState } from "react";
import { updateCustomerProfile, updateStaffProfile } from "./actions";
import { ITALIAN_PROVINCES } from "@/lib/domain/italian-provinces";

type CustomerProfileValues = {
  customerType: "private" | "business";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLegacy: string;
  addressStreet: string;
  addressNumber: string;
  addressPostalCode: string;
  addressCity: string;
  addressProvince: string;
  addressCountry: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  pec: string;
  recipientCode: string;
};

export function CustomerProfileForm({ initial }: { initial: CustomerProfileValues }) {
  const customerType = initial.customerType;
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
          <label className="profile-field-full" htmlFor="customerType">
            Tipo cliente
            <select
              id="customerType"
              value={customerType}
              disabled
              aria-describedby="customer-type-help"
            >
              <option value="private">Privato</option>
              <option value="business">Partita IVA</option>
            </select>
            <small id="customer-type-help">Il tipo di account viene scelto alla registrazione e non può essere modificato.</small>
          </label>
          {customerType === "private" ? (
            <>
              <label>Nome<input name="firstName" defaultValue={initial.firstName} maxLength={100} required /></label>
              <label>Cognome<input name="lastName" defaultValue={initial.lastName} maxLength={100} required /></label>
              <label className="profile-field-full">Codice fiscale<input name="taxCode" defaultValue={initial.taxCode} maxLength={16} pattern="[A-Za-z0-9]{16}" title="Inserisci 16 caratteri alfanumerici." required /></label>
            </>
          ) : (
            <>
              <label className="profile-field-full">Ragione sociale<input name="companyName" defaultValue={initial.companyName} maxLength={160} required /></label>
              <label className="profile-field-full">Partita IVA<input name="vatNumber" defaultValue={initial.vatNumber} maxLength={11} pattern="[0-9]{11}" title="Inserisci 11 cifre." required /></label>
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
          {initial.addressLegacy && !initial.addressStreet && (
            <p className="profile-field-full profile-legacy-address">
              Indirizzo attuale: {initial.addressLegacy}. Completa i campi qui sotto per aggiornarlo in formato strutturato.
            </p>
          )}
          <label>Via / piazza<input name="addressStreet" defaultValue={initial.addressStreet} autoComplete="address-line1" maxLength={160} required /></label>
          <label>Numero civico<input name="addressNumber" defaultValue={initial.addressNumber} autoComplete="address-line2" maxLength={20} required /></label>
          <label>CAP<input name="addressPostalCode" defaultValue={initial.addressPostalCode} autoComplete="postal-code" maxLength={5} pattern="[0-9]{5}" title="Inserisci 5 cifre." required /></label>
          <label>Comune<input name="addressCity" defaultValue={initial.addressCity} autoComplete="address-level2" maxLength={100} required /></label>
          <label>Provincia
            <select name="addressProvince" defaultValue={initial.addressProvince} autoComplete="address-level1" required>
              <option value="" disabled>Seleziona</option>
              {ITALIAN_PROVINCES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
          <label>Nazione
            <span className="profile-country-fixed" aria-label="Nazione: Italia">
              <svg className="country-flag" viewBox="0 0 3 2" aria-hidden="true" focusable="false">
                <path fill="#009246" d="M0 0h1v2H0z" /><path fill="#fff" d="M1 0h1v2H1z" /><path fill="#ce2b37" d="M2 0h1v2H2z" />
              </svg>
              Italia
            </span>
            <input type="hidden" name="addressCountry" value="Italia" />
          </label>
          {customerType === "business" && (
            <>
              <label>PEC<input name="pec" type="email" defaultValue={initial.pec} maxLength={320} onInput={(event) => setPec(event.currentTarget.value)} required={!recipientCode} /></label>
              <label>Codice destinatario<input name="recipientCode" defaultValue={initial.recipientCode} maxLength={7} pattern="[A-Za-z0-9]{7}" title="Inserisci 7 caratteri alfanumerici." onInput={(event) => setRecipientCode(event.currentTarget.value)} required={!pec} /></label>
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
