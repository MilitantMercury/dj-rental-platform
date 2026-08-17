"use client";

import { useRef, useState } from "react";
import { Field, FieldLabel } from "@/components/auth-form";

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
      <Field label="Indirizzo" name="address" autoComplete="street-address" maxLength={300} />
      {customerType === "private" ? (
        <Field label="Codice fiscale" name="taxCode" maxLength={32} />
      ) : (
        <>
          <Field label="Partita IVA" name="vatNumber" maxLength={32} />
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
                maxLength={16}
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
