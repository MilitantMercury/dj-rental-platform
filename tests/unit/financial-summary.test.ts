import { describe, expect, it } from "vitest";
import { calculateFinancialSummary } from "@/lib/financial-summary";

describe("riepilogo economico", () => {
  it("separa gli incassi del noleggio dalla cauzione da restituire", () => {
    expect(calculateFinancialSummary(49000, [
      { record_type: "advance_received", amount_cents: 10000 },
      { record_type: "balance_received", amount_cents: 15000 },
      { record_type: "deposit_received", amount_cents: 5000 },
      { record_type: "deposit_returned", amount_cents: 1000 },
    ])).toEqual({
      cashCollectedCents: 29000,
      rentalCollectedCents: 25000,
      rentalOutstandingCents: 24000,
      depositToReturnCents: 4000,
    });
  });

  it("non riduce il totale del preventivo quando viene incassato un anticipo", () => {
    expect(calculateFinancialSummary(15000, [
      { record_type: "advance_received", amount_cents: 2000 },
    ])).toMatchObject({
      rentalCollectedCents: 2000,
      rentalOutstandingCents: 13000,
    });
  });
});
