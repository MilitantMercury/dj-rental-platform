import { describe, expect, it } from "vitest";
import { requestSubmissionErrorMessage, validateRequestSubmission } from "@/lib/request-submission";

const valid = { eventType:"Matrimonio", eventStartAt:"2026-09-01T16:00:00Z", eventEndAt:"2026-09-02T01:00:00Z", venueName:"Villa", venueStreet:"Via Roma", venueNumber:"1", venuePostalCode:"20100", venueCity:"Milano", venueProvince:"MI", deliveryResponsibility:"owner", pickupResponsibility:"customer", notes:"", privacyAccepted:true };

describe("request submission", () => {
  it("accetta dati completi", () => expect(validateRequestSubmission(valid)).toBeNull());
  it("rifiuta intervalli invertiti", () => expect(validateRequestSubmission({...valid,eventEndAt:valid.eventStartAt})).toMatch(/fine/));
  it("rifiuta indirizzi e privacy non validi", () => {
    expect(validateRequestSubmission({...valid,venuePostalCode:"123"})).toMatch(/indirizzo/);
    expect(validateRequestSubmission({...valid,privacyAccepted:false})).toMatch(/privacy/);
  });
  it("traduce gli errori atomici senza esporre dettagli", () => {
    expect(requestSubmissionErrorMessage("empty_cart")).toMatch(/carrello/);
    expect(requestSubmissionErrorMessage("catalog_changed")).toMatch(/catalogo/);
    expect(requestSubmissionErrorMessage("postgres internals")).not.toContain("postgres");
  });
});
