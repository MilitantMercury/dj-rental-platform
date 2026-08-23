import Link from "next/link";
import { redirect } from "next/navigation";
import { DateTimeInput } from "@/components/date-time-input";
import { EventTypeField } from "@/components/event-type-field";
import { RequestSelection } from "@/components/request-selection";
import { AppMessage } from "@/components/app-message";
import { ITALIAN_PROVINCES } from "@/lib/domain/italian-provinces";
import { createClient } from "@/lib/supabase/server";
import { createRequest } from "./actions";

export const dynamic = "force-dynamic";

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/registrazione?next=%2Frichiesta");
  const [{ data: eventTypes }, { data: cart }] = await Promise.all([
    supabase.from("event_types").select("name").eq("active", true).order("sort_order"),
    supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle(),
  ]);
  if (!cart) redirect("/carrello");
  const { data: cartRows } = await supabase.from("cart_items").select("item_type,product_id,service_id,quantity").eq("cart_id", cart.id);
  if (!cartRows?.length) redirect("/carrello");
  const productIds = cartRows.map((item) => item.product_id).filter((id): id is string => Boolean(id));
  const serviceIds = cartRows.map((item) => item.service_id).filter((id): id is string => Boolean(id));
  const [{ data: products }, { data: services }] = await Promise.all([
    productIds.length ? supabase.from("products").select("id,name").in("id", productIds) : Promise.resolve({ data: [] }),
    serviceIds.length ? supabase.from("services").select("id,name").in("id", serviceIds) : Promise.resolve({ data: [] }),
  ]);
  const itemNames = new Map([...(products ?? []), ...(services ?? [])].map((item) => [item.id, item.name]));
  const selection = cartRows.map((item) => ({ id: item.product_id ?? item.service_id ?? "", name: itemNames.get(item.product_id ?? item.service_id ?? "") ?? "Elemento del catalogo", type: item.item_type as "product" | "service", quantity: item.quantity }));
  const { message } = await searchParams;
  return <main className="auth-shell"><section className="auth-card request-card">
    <Link href="/catalogo">← Torna al catalogo</Link><h1>Raccontaci il tuo evento.</h1><p>Il gestore verificherà i dettagli e preparerà una proposta.</p>
    {message === "request-sent" && <AppMessage message="Richiesta inviata con successo." />}
    {message && message !== "request-sent" && <AppMessage message={message} tone="error" />}
    <form className="auth-form request-form" action={createRequest}>
      <RequestSelection items={selection} />
      <section className="request-section"><h2 className="request-section-title">Evento e date</h2><div className="request-event-grid">
        <EventTypeField types={(eventTypes ?? []).map((item) => item.name)} />
        <label>Data e ora inizio<DateTimeInput name="eventStartAt" required /></label>
        <label>Data e ora fine<DateTimeInput name="eventEndAt" required /></label>
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
