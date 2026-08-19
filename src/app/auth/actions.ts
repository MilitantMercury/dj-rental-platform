"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidCustomerDetails, normalizePec, normalizeRecipientCode, normalizeTaxCode, normalizeVatNumber } from "@/lib/domain/customer-registration";
import { isDuplicateRegistration } from "@/lib/domain/registration";

const read = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};
const fail = (path: string, message: string): never => redirect(`${path}?message=${encodeURIComponent(message)}`);

export async function signUp(data: FormData) {
  const firstName = read(data, "firstName"), lastName = read(data, "lastName");
  const email = read(data, "email"), password = read(data, "password"), passwordConfirmation = read(data, "passwordConfirmation");
  const phone = read(data, "phone"), addressStreet = read(data, "addressStreet"), addressNumber = read(data, "addressNumber"), addressPostalCode = read(data, "addressPostalCode"), addressCity = read(data, "addressCity"), addressProvince = read(data, "addressProvince").toUpperCase(), addressCountry = read(data, "addressCountry");
  const address = [addressStreet, addressNumber, addressPostalCode, addressCity, addressProvince, addressCountry].filter(Boolean).join(", ");
  const customerType = read(data, "customerType");
  const companyName = read(data, "companyName"), taxCode = normalizeTaxCode(read(data, "taxCode")), vatNumber = normalizeVatNumber(read(data, "vatNumber"));
  const pec = normalizePec(read(data, "pec")), recipientCode = normalizeRecipientCode(read(data, "recipientCode"));
  if (password !== passwordConfirmation) fail("/registrazione", "Le password non coincidono.");
  if (!email || password.length < 10 || !hasValidCustomerDetails({ customerType, firstName, lastName, phone, addressStreet, addressNumber, addressPostalCode, addressCity, addressProvince, addressCountry, companyName, taxCode, vatNumber, pec, recipientCode })) fail("/registrazione", "Controlla i dati obbligatori e usa almeno 10 caratteri per la password.");
  const supabase = await createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName, phone, address, address_street: addressStreet, address_number: addressNumber, address_postal_code: addressPostalCode, address_city: addressCity, address_province: addressProvince, address_country: addressCountry, customer_type: customerType, company_name: companyName, tax_code: taxCode, vat_number: vatNumber, pec, recipient_code: recipientCode } } });
  if (isDuplicateRegistration({ errorCode: error?.code, errorMessage: error?.message, identities: signUpData.user?.identities })) {
    fail("/registrazione", "Esiste già un account con questa email. Accedi oppure recupera la password.");
  }
  if (error) {
    if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
      fail("/registrazione", "Codice fiscale o Partita IVA già associati a un altro account.");
    }
    fail("/registrazione", "Non è stato possibile creare l’account.");
  }
  fail("/accesso", "Controlla la tua email e conferma l’indirizzo prima di accedere.");
}

export async function signIn(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: read(data, "email"), password: read(data, "password") });
  if (error) fail("/accesso", "Email o password non validi, oppure email non ancora verificata.");
  redirect("/");
}

export async function requestPasswordReset(data: FormData) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(read(data, "email"), { redirectTo: `${read(data, "origin")}/auth/callback?next=/nuova-password` });
  fail("/password-dimenticata", "Se l’indirizzo è registrato, riceverai le istruzioni via email.");
}

export async function updatePassword(data: FormData) {
  const password = read(data, "password");
  if (password.length < 10) fail("/nuova-password", "La password deve contenere almeno 10 caratteri.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) fail("/nuova-password", "Il link non è valido o è scaduto.");
  redirect("/area-riservata");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
