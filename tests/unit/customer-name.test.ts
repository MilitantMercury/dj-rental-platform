import { describe, expect, it } from "vitest";
import { customerDisplayName } from "@/lib/customer-name";

describe("nome visualizzato del cliente", () => {
  it("usa nome e cognome per un privato", () => {
    expect(
      customerDisplayName(
        { first_name: "Mario", last_name: "Rossi" },
        { customer_type: "private", company_name: null },
        "cliente@example.test",
      ),
    ).toBe("Mario Rossi");
  });

  it("usa la ragione sociale per una Partita IVA", () => {
    expect(
      customerDisplayName(
        { first_name: "", last_name: "" },
        { customer_type: "business", company_name: "Audio Service SRL" },
        "cliente@example.test",
      ),
    ).toBe("Audio Service SRL");
  });

  it("usa il recapito disponibile per i vecchi profili incompleti", () => {
    expect(
      customerDisplayName(
        { first_name: "", last_name: "" },
        { customer_type: "private", company_name: null },
        "cliente@example.test",
      ),
    ).toBe("cliente@example.test");
  });
});
