"use client";

import { useRef, useState } from "react";
import { Field, FieldLabel } from "@/components/auth-form";
import { ITALIAN_PROVINCES } from "@/lib/domain/italian-provinces";

export function RegistrationFields() {
  const [customerType, setCustomerType] = useState<"private" | "business">("private");
  const [pec, setPec] = useState("");
  const [recipientCode, setRecipientCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);
  const passwordsDoNotMatch = passwordConfirmation.length > 0 && password !== passwordConfirmation;

  const validatePasswordConfirmation = (nextPassword: string, nextConfirmation: string) => {
    passwordConfirmationRef.current?.setCustomValidity(
      nextConfirmation && nextPassword !== nextConfirmation
        ? "Le password non coincidono."
        : "",
    );
  };

  return (
    <div className="registration-fields">
      <label>
        <FieldLabel>Tipo cliente</FieldLabel>
        <select name="customerType" value={customerType} onChange={(event) => setCustomerType(event.target.value as "private" | "business")} required>
          <option value="private">Privato</option>
          <option value="business">Partita IVA</option>
        </select>
      </label>
      {customerType === "private" ? (
        <div className="field-row">
          <Field label="Nome" name="firstName" autoComplete="given-name" maxLength={100} />
          <Field label="Cognome" name="lastName" autoComplete="family-name" maxLength={100} />
        </div>
      ) : (
        <Field label="Ragione sociale" name="companyName" autoComplete="organization" maxLength={160} />
      )}
      <Field label="Email" name="email" type="email" autoComplete="email" maxLength={320} />
      <Field label="Telefono" name="phone" type="tel" autoComplete="tel" minLength={6} maxLength={30} />
      <div className="field-row">
        <Field label="Via / piazza" name="addressStreet" autoComplete="address-line1" maxLength={160} />
        <Field label="Numero civico" name="addressNumber" autoComplete="address-line2" maxLength={20} />
      </div>
      <div className="field-row address-row-three">
        <Field label="CAP" name="addressPostalCode" autoComplete="postal-code" maxLength={5} pattern="[0-9]{5}" title="Inserisci 5 cifre." />
        <Field label="Comune" name="addressCity" autoComplete="address-level2" maxLength={100} />
        <label>
          <FieldLabel>Provincia</FieldLabel>
          <select name="addressProvince" autoComplete="address-level1" required defaultValue="">
            <option value="" disabled>Seleziona</option>
            {ITALIAN_PROVINCES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
      </div>
      <label>
        <FieldLabel>Nazione</FieldLabel>
        <span className="country-fixed" aria-label="Nazione: Italia">
          <svg className="country-flag" viewBox="0 0 3 2" aria-hidden="true" focusable="false">
            <path fill="#009246" d="M0 0h1v2H0z" /><path fill="#fff" d="M1 0h1v2H1z" /><path fill="#ce2b37" d="M2 0h1v2H2z" />
          </svg>
          Italia
        </span>
        <input type="hidden" name="addressCountry" value="Italia" />
      </label>
      {customerType === "private" ? (
        <Field label="Codice fiscale" name="taxCode" maxLength={16} pattern="[A-Za-z0-9]{16}" title="Inserisci 16 caratteri alfanumerici." />
      ) : (
        <>
          <Field label="Partita IVA" name="vatNumber" maxLength={11} pattern="[0-9]{11}" title="Inserisci 11 cifre." />
          <div className="field-row">
            <label>
              <FieldLabel>PEC</FieldLabel>
              <input
                name="pec"
                type="email"
                autoComplete="email"
                maxLength={320}
                onInput={(event) => setPec(event.currentTarget.value)}
                required={!recipientCode}
              />
            </label>
            <label>
              <FieldLabel>Codice destinatario</FieldLabel>
              <input
                name="recipientCode"
                maxLength={7}
                pattern="[A-Za-z0-9]{7}"
                title="Inserisci 7 caratteri alfanumerici."
                onInput={(event) => setRecipientCode(event.currentTarget.value)}
                required={!pec}
              />
            </label>
          </div>
          <small className="field-help">Inserisci almeno uno tra PEC e codice destinatario.</small>
        </>
      )}
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={10}
        onInput={(event) => {
          const nextPassword = event.currentTarget.value;
          setPassword(nextPassword);
          validatePasswordConfirmation(nextPassword, passwordConfirmation);
        }}
      />
      <label>
        <FieldLabel>Conferma password</FieldLabel>
        <input
          ref={passwordConfirmationRef}
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          aria-invalid={passwordsDoNotMatch}
          aria-describedby={passwordsDoNotMatch ? "password-confirmation-error" : undefined}
          onInput={(event) => {
            const nextConfirmation = event.currentTarget.value;
            setPasswordConfirmation(nextConfirmation);
            validatePasswordConfirmation(password, nextConfirmation);
          }}
        />
      </label>
      {passwordsDoNotMatch && <p id="password-confirmation-error" className="field-error" role="alert">Le password non coincidono.</p>}
    </div>
  );
}
