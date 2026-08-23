import { describe, expect, it } from "vitest";
import { catalogReferencePrice, hasExactRequestedQuantities } from "@/lib/quote-lines";

describe("righe del preventivo", () => {
  it("propone il prezzo catalogo corretto lasciando zero quando non configurato", () => {
    const productPrices = new Map([["product-1", 200]]);
    const servicePrices = new Map([["service-1", 15000]]);

    expect(catalogReferencePrice({ itemType: "product", itemId: "product-1" }, productPrices, servicePrices)).toBe(200);
    expect(catalogReferencePrice({ itemType: "service", itemId: "service-1" }, productPrices, servicePrices)).toBe(15000);
    expect(catalogReferencePrice({ itemType: "product", itemId: "missing" }, productPrices, servicePrices)).toBe(0);
  });
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
