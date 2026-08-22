import { describe, expect, it } from "vitest";
import { calculateQuoteTotals, euroToCents, formatEuroInput } from "@/lib/quote-pricing";

describe("importi del preventivo", () => {
  it("converte importi in euro in centesimi senza arrotondamenti impliciti", () => {
    expect(euroToCents("12,50")).toBe(1250);
    expect(euroToCents("12.5")).toBe(1250);
    expect(euroToCents("1.000,00")).toBe(100000);
    expect(euroToCents("0")).toBe(0);
    expect(formatEuroInput(100000)).toBe("1.000,00");
  });

  it("rifiuta formati ambigui o importi negativi", () => {
    expect(euroToCents("12,345")).toBeNull();
    expect(euroToCents("-1")).toBeNull();
  });

  it("calcola i totali della bozza e impedisce sconti superiori al subtotale", () => {
    expect(calculateQuoteTotals([1250, 800], 50)).toEqual({
      subtotalCents: 2050,
      totalCents: 2000,
    });
    expect(calculateQuoteTotals([1250], 1251)).toBeNull();
  });
});
