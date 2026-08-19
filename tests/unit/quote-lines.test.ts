import { describe, expect, it } from "vitest";
import { hasExactRequestedQuantities } from "@/lib/quote-lines";

describe("righe del preventivo", () => {
  const requested = [{ id: "console", quantity: 2 }, { id: "service", quantity: 1 }];

  it("accetta una riga divisa quando la quantità complessiva resta invariata", () => {
    expect(hasExactRequestedQuantities(requested, [
      { sourceRequestItemId: "console", quantity: 1 },
      { sourceRequestItemId: "console", quantity: 1 },
      { sourceRequestItemId: "service", quantity: 1 },
    ])).toBe(true);
  });

  it("rifiuta quantità mancanti, eccedenti o riferimenti estranei", () => {
    expect(hasExactRequestedQuantities(requested, [{ sourceRequestItemId: "console", quantity: 1 }, { sourceRequestItemId: "service", quantity: 1 }])).toBe(false);
    expect(hasExactRequestedQuantities(requested, [{ sourceRequestItemId: "console", quantity: 3 }, { sourceRequestItemId: "service", quantity: 1 }])).toBe(false);
    expect(hasExactRequestedQuantities(requested, [{ sourceRequestItemId: "other", quantity: 1 }])).toBe(false);
  });
});
