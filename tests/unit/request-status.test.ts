import { describe, expect, it } from "vitest";
import {
  ACTIVE_REQUEST_STATUSES,
  ARCHIVED_REQUEST_STATUSES,
  isArchivedRequestStatus,
  requestStatusLabel,
} from "@/lib/request-status";

describe("etichette degli stati pratica", () => {
  it.each([
    ["received", "Ricevuta"],
    ["in_review", "In valutazione"],
    ["rejected", "Rifiutata"],
    ["cancelled", "Annullata"],
    ["quote_draft", "Preventivo in preparazione"],
    ["quote_published", "Preventivo inviato"],
    ["changes_requested", "Modifiche richieste"],
    ["accepted", "Accettata"],
    ["confirmed", "Confermata"],
    ["closed", "Chiusa"],
  ])("traduce %s", (status, expected) => {
    expect(requestStatusLabel(status)).toBe(expected);
  });

  it("separa gli stati operativi da quelli archiviati", () => {
    expect(ACTIVE_REQUEST_STATUSES).toEqual([
      "received",
      "in_review",
      "quote_draft",
      "quote_published",
      "changes_requested",
      "accepted",
      "confirmed",
    ]);
    expect(ARCHIVED_REQUEST_STATUSES).toEqual([
      "closed",
      "cancelled",
      "rejected",
    ]);
    expect(isArchivedRequestStatus("closed")).toBe(true);
    expect(isArchivedRequestStatus("confirmed")).toBe(false);
  });
});
