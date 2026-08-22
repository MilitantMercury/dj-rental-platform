export type RequestSubmissionInput = {
  eventType: string;
  eventStartAt: string | null;
  eventEndAt: string | null;
  venueName: string;
  venueStreet: string;
  venueNumber: string;
  venuePostalCode: string;
  venueCity: string;
  venueProvince: string;
  deliveryResponsibility: string;
  pickupResponsibility: string;
  notes: string;
  privacyAccepted: boolean;
};

export function validateRequestSubmission(input: RequestSubmissionInput): string | null {
  if (!input.eventType || input.eventType.length > 100 || !input.eventStartAt || !input.eventEndAt) return "Completa i dati obbligatori dell’evento.";
  if (input.eventEndAt <= input.eventStartAt) return "La data e ora di fine deve seguire l’inizio.";
  if (!input.venueName || !input.venueStreet || !input.venueNumber || !/^\d{5}$/.test(input.venuePostalCode) || !/^[A-Z]{2}$/.test(input.venueProvince) || !input.venueCity) return "Completa correttamente l’indirizzo della location.";
  if (!["owner", "customer"].includes(input.deliveryResponsibility) || !["owner", "customer"].includes(input.pickupResponsibility)) return "Seleziona le modalità di consegna e ritiro.";
  if (input.notes.length > 2000) return "Le note non possono superare 2.000 caratteri.";
  if (!input.privacyAccepted) return "Accetta l’informativa privacy per inviare la richiesta.";
  return null;
}

export function requestSubmissionErrorMessage(message?: string): string {
  if (message?.includes("empty_cart")) return "Il carrello è vuoto. Aggiungi almeno un prodotto o servizio.";
  if (message?.includes("catalog_changed")) return "Il catalogo è cambiato. Controlla il carrello e riprova.";
  if (message?.includes("email_not_verified")) return "Verifica il tuo indirizzo email prima dell’invio.";
  return "Non è stato possibile inviare la richiesta. Riprova.";
}
