import { describe, expect, it } from "vitest";
import { romeDateTimeLocalToIso } from "@/lib/event-time";

describe("conversione data e ora evento Europe/Rome", () => {
  it("converte una data locale nell'istante UTC corrispondente durante l'ora legale", () => {
    expect(romeDateTimeLocalToIso("2026-08-17T18:45")).toBe(
      "2026-08-17T16:45:00.000Z",
    );
  });

  it("rifiuta un valore locale non valido", () => {
    expect(romeDateTimeLocalToIso("17/08/2026 18:45")).toBe("");
  });
});
