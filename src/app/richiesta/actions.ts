"use server";

import { redirect } from "next/navigation";
import { hasValidStructuredAddress } from "@/lib/domain/customer-registration";
import { romeDateTimeLocalToIso } from "@/lib/event-time";
import { requestSubmissionErrorMessage, validateRequestSubmission } from "@/lib/request-submission";
import { createClient } from "@/lib/supabase/server";

const read = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};
const fail = (message: string): never => redirect(`/richiesta?message=${encodeURIComponent(message)}`);

export async function createRequest(data: FormData) {
  const selectedEventType = read(data, "eventType");
  const eventType = selectedEventType === "Altro" ? read(data, "otherEventType") : selectedEventType;
  const eventStartAt = romeDateTimeLocalToIso(read(data, "eventStartAt"));
  const eventEndAt = romeDateTimeLocalToIso(read(data, "eventEndAt"));
  const venueName = read(data, "venueName");
  const venueStreet = read(data, "venueStreet");
  const venueNumber = read(data, "venueNumber");
  const venuePostalCode = read(data, "venuePostalCode");
  const venueCity = read(data, "venueCity");
  const venueProvince = read(data, "venueProvince").toUpperCase();
  const venueCountry = "Italia";
  const deliveryResponsibility = read(data, "deliveryResponsibility");
  const pickupResponsibility = read(data, "pickupResponsibility");
  const notes = read(data, "notes");
  const privacyAccepted = data.get("privacy") === "on";
  const validation = validateRequestSubmission({ eventType, eventStartAt, eventEndAt, venueName, venueStreet, venueNumber, venuePostalCode, venueCity, venueProvince, deliveryResponsibility, pickupResponsibility, notes, privacyAccepted });
  if (validation || !hasValidStructuredAddress({ street: venueStreet, number: venueNumber, postalCode: venuePostalCode, city: venueCity, province: venueProvince, country: venueCountry })) fail(validation ?? "Completa correttamente l’indirizzo della location.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at) fail("Devi accedere con un indirizzo email verificato.");
  const { error } = await supabase.rpc("submit_quote_request", {
    p_event_type: eventType,
    p_event_start_at: eventStartAt!,
    p_event_end_at: eventEndAt!,
    p_venue_name: venueName,
    p_venue_street: venueStreet,
    p_venue_number: venueNumber,
    p_venue_postal_code: venuePostalCode,
    p_venue_city: venueCity,
    p_venue_province: venueProvince,
    p_venue_country: venueCountry,
    p_delivery_responsibility: deliveryResponsibility,
    p_pickup_responsibility: pickupResponsibility,
    p_customer_notes: notes,
    p_privacy_accepted: privacyAccepted,
  });
  if (error) fail(requestSubmissionErrorMessage(error.message));
  redirect("/richiesta/inviata");
}
