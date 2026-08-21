import { describe, expect, it } from "vitest";
import { financialRecordLabel, isFinancialRecordType } from "@/lib/financial-records";

describe("registrazioni economiche", () => {
  it("riconosce soltanto le tipologie finanziarie previste", () => {
    expect(isFinancialRecordType("deposit_received")).toBe(true);
    expect(isFinancialRecordType("supplier_cost")).toBe(false);
  });

  it("traduce le tipologie in italiano senza esporre codici tecnici", () => {
    expect(financialRecordLabel("balance_received")).toBe("Saldo incassato");
    expect(financialRecordLabel("unknown")).toBe("Registrazione");
  });
});
