import { describe, expect, it } from "vitest";
import { euroToCents } from "@/lib/quote-pricing";

describe("importi del preventivo", () => {
  it("converte importi in euro in centesimi senza arrotondamenti impliciti", () => {
    expect(euroToCents("12,50")).toBe(1250);
    expect(euroToCents("12.5")).toBe(1250);
    expect(euroToCents("0")).toBe(0);
  });

  it("rifiuta formati ambigui o importi negativi", () => {
    expect(euroToCents("12.345")).toBeNull();
    expect(euroToCents("-1")).toBeNull();
  });
});
