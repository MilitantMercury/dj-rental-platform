import { describe, expect, it } from "vitest";
import { hasValidCustomerDetails } from "@/lib/domain/customer-registration";

const base = {
  firstName: "Mario",
  lastName: "Rossi",
  phone: "3331234567",
  address: "Via Roma 1, Milano",
  companyName: "",
  taxCode: "",
  vatNumber: "",
  pec: "",
  recipientCode: "",
};

describe("dati obbligatori di registrazione cliente", () => {
  it("richiede il codice fiscale al privato", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "private", taxCode: "RSSMRA80A01F205X" })).toBe(true);
  });

  it("richiede ragione sociale, partita IVA e un recapito elettronico all'azienda", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "business", companyName: "Audio SRL" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01234567890" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01234567890", pec: "audio@pec.it" })).toBe(true);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01234567890", recipientCode: "ABC1234" })).toBe(true);
  });

  it("richiede sempre telefono e indirizzo", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private", taxCode: "RSSMRA80A01F205X", phone: "" })).toBe(false);
  });

  it("richiede nome e cognome soltanto al privato", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private", firstName: "", taxCode: "RSSMRA80A01F205X" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01234567890", pec: "audio@pec.it" })).toBe(true);
  });
});
