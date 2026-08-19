import Link from "next/link";
import { redirect } from "next/navigation";
import { EventTypeField } from "@/components/event-type-field";
import { ITALIAN_PROVINCES } from "@/lib/domain/italian-provinces";
import { createClient } from "@/lib/supabase/server";
import { createRequest } from "./actions";

export const dynamic = "force-dynamic";

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/registrazione?next=%2Frichiesta");
  const { data: eventTypes } = await supabase.from("event_types").select("name").eq("active", true).order("sort_order");
  const { message } = await searchParams;
  return <main className="auth-shell"><section className="auth-card request-card">
    <Link href="/catalogo">← Torna al catalogo</Link><h1>Raccontaci il tuo evento.</h1><p>Il gestore verificherà i dettagli e preparerà una proposta.</p>
    {message === "request-sent" && <div className="auth-message request-success" role="status">Richiesta inviata con successo.</div>}
    <form className="auth-form request-form" action={createRequest}>
      <section className="request-section"><h2 className="request-section-title">Evento e date</h2><div className="request-event-grid">
        <EventTypeField types={(eventTypes ?? []).map((item) => item.name)} />
        <label>Data inizio<input name="eventDate" type="date" required /></label>
        <label>Data fine<input name="eventEndDate" type="date" required /></label>
      </div></section>
      <fieldset className="request-section"><legend className="request-section-title">Location</legend><div className="request-location-grid">
        <label className="request-location-full">Nome della location<input name="venueName" required maxLength={160} placeholder="Es. Villa Rossi" /></label>
        <label>Via / piazza<input name="venueStreet" autoComplete="address-line1" required maxLength={160} /></label>
        <label>Numero civico<input name="venueNumber" autoComplete="address-line2" required maxLength={20} /></label>
        <label>CAP<input name="venuePostalCode" autoComplete="postal-code" required maxLength={5} pattern="[0-9]{5}" title="Inserisci 5 cifre." /></label>
        <label>Comune<input name="venueCity" autoComplete="address-level2" required maxLength={100} /></label>
        <label>Provincia<select name="venueProvince" autoComplete="address-level1" required defaultValue=""><option value="" disabled>Seleziona</option>{ITALIAN_PROVINCES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label>Nazione<span className="country-fixed" aria-label="Nazione: Italia"><svg className="country-flag" viewBox="0 0 3 2" aria-hidden="true" focusable="false"><path fill="#009246" d="M0 0h1v2H0z" /><path fill="#fff" d="M1 0h1v2H1z" /><path fill="#ce2b37" d="M2 0h1v2H2z" /></svg>Italia</span><input type="hidden" name="venueCountry" value="Italia" /></label>
      </div></fieldset>
      <fieldset className="request-section"><legend className="request-section-title">Logistica</legend><div className="request-logistics-options">
        <label>Consegna<select name="deliveryResponsibility" defaultValue="customer"><option value="owner">A carico del gestore</option><option value="customer">A carico del cliente</option></select></label>
        <label>Ritiro<select name="pickupResponsibility" defaultValue="customer"><option value="owner">A carico del gestore</option><option value="customer">A carico del cliente</option></select></label>
      </div></fieldset>
      <section className="request-section request-notes"><label htmlFor="notes">Note aggiuntive</label><textarea id="notes" name="notes" maxLength={2000} rows={4} placeholder="Raccontaci eventuali esigenze particolari" /></section>
      <div className="request-footer"><label className="request-privacy"><input type="checkbox" name="privacy" required /><span>Ho letto e accetto il trattamento dei dati per gestire la richiesta.</span></label><button className="request-submit" type="submit">Invia richiesta</button></div>
    </form>
  </section></main>;
}
