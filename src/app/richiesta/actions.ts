"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const read = (data: FormData, key: string) => { const value = data.get(key); return typeof value === "string" ? value.trim() : ""; };
const fail = (message: string): never => redirect(`/richiesta?message=${encodeURIComponent(message)}`);
export async function createRequest(data: FormData) {
  const selectedEventType = read(data, "eventType"), otherEventType = read(data, "otherEventType"), eventType = selectedEventType === "Altro" ? otherEventType : selectedEventType, eventDate = read(data, "eventDate"), eventEndDate = read(data, "eventEndDate"), venueName = read(data, "venueName"), venueAddress = read(data, "venueAddress"), deliveryResponsibility = read(data, "deliveryResponsibility"), pickupResponsibility = read(data, "pickupResponsibility"), notes = read(data, "notes");
  if (!eventType || !eventDate || !eventEndDate || !venueName || !venueAddress || !["owner", "customer"].includes(deliveryResponsibility) || !["owner", "customer"].includes(pickupResponsibility) || data.get("privacy") !== "on") fail("Completa i dati obbligatori e accetta l’informativa privacy.");
  if (eventEndDate < eventDate) fail("La data di fine non può precedere quella di inizio.");
  const supabase = await createClient(); const { data: authData } = await supabase.auth.getUser(); const user = authData.user;
  if (!user) return fail("Devi accedere con un indirizzo email verificato.");
  if (!user.email_confirmed_at) return fail("Devi accedere con un indirizzo email verificato.");
  const { error } = await supabase.from("requests").insert({ customer_email: user.email ?? "", request_code: `R-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, customer_user_id: user.id, event_type: eventType, event_date: eventDate, event_end_date: eventEndDate, venue_name: venueName, venue_address: venueAddress, logistics_mode: "delivery", delivery_responsibility: deliveryResponsibility as "owner" | "customer", pickup_responsibility: pickupResponsibility as "owner" | "customer", customer_notes: notes, privacy_accepted_at: new Date().toISOString(), status: "received" } as never);
  if (error) fail("Non è stato possibile inviare la richiesta. Riprova.");
  const { data: cart } = await supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle();
  if (cart) { await supabase.from("cart_items").delete().eq("cart_id", cart.id); }
  redirect("/richiesta/inviata");
}
