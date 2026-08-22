import { describe, expect, it } from "vitest";
import {
  ACTIVE_REQUEST_STATUSES,
  ARCHIVED_REQUEST_STATUSES,
  isArchivedRequestStatus,
  requestStatusLabel,
  requestStatusTone,
} from "@/lib/request-status";
import {
  defaultStatusTransitionNote,
  isAllowedOwnerStatusTransition,
  ownerStatusTransitions,
} from "@/lib/request-lifecycle";

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
    ["awaiting_deposit", "In attesa caparra"],
    ["confirmed", "Confermata"],
    ["preparing", "In preparazione"],
    ["delivered_or_collected", "Consegnata / ritirata"],
    ["returned", "Restituita"],
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
      "option",
      "changes_requested",
      "accepted",
      "awaiting_deposit",
      "confirmed",
      "preparing",
      "delivered_or_collected",
      "returned",
    ]);
    expect(ARCHIVED_REQUEST_STATUSES).toEqual([
      "closed",
      "cancelled",
      "rejected",
    ]);
    expect(isArchivedRequestStatus("closed")).toBe(true);
    expect(isArchivedRequestStatus("confirmed")).toBe(false);
  });

  it("assegna un tono visivo coerente agli stati", () => {
    expect(requestStatusTone("received")).toBe("active");
    expect(requestStatusTone("quote_published")).toBe("attention");
    expect(requestStatusTone("confirmed")).toBe("operational");
    expect(requestStatusTone("closed")).toBe("closed");
    expect(requestStatusTone("cancelled")).toBe("critical");
  });

  it("consente la conferma e la chiusura soltanto nel giusto ordine", () => {
    expect(ownerStatusTransitions("received")).toEqual(["in_review", "rejected", "cancelled"]);
    expect(isAllowedOwnerStatusTransition("received", "in_review")).toBe(true);
    expect(isAllowedOwnerStatusTransition("accepted", "confirmed")).toBe(false);
    expect(isAllowedOwnerStatusTransition("confirmed", "closed")).toBe(false);
  });

  it("registra una nota di audit per gli aggiornamenti manuali", () => {
    expect(defaultStatusTransitionNote()).toContain("owner");
  });
});
