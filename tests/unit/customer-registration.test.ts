import { describe, expect, it } from "vitest";
import { hasValidCustomerDetails, isValidTaxCode, isValidVatNumber } from "@/lib/domain/customer-registration";

const base = {
  firstName: "Mario",
  lastName: "Rossi",
  phone: "3331234567",
  addressStreet: "Via Roma",
  addressNumber: "1",
  addressPostalCode: "20100",
  addressCity: "Milano",
  addressProvince: "MI",
  addressCountry: "Italia",
  companyName: "",
  taxCode: "",
  vatNumber: "",
  pec: "",
  recipientCode: "",
};

describe("dati obbligatori di registrazione cliente", () => {
  it("valida il carattere di controllo di codice fiscale e Partita IVA", () => {
    expect(isValidTaxCode("RSSMRA80A01F205X")).toBe(true);
    expect(isValidTaxCode("RSSMRA80A01F205Y")).toBe(false);
    expect(isValidVatNumber("01114601006")).toBe(true);
    expect(isValidVatNumber("01114601007")).toBe(false);
  });
  it("richiede il codice fiscale al privato", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "private", taxCode: "RSSMRA80A01F205X" })).toBe(true);
  });

  it("richiede ragione sociale, partita IVA e un recapito elettronico all'azienda", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "business", companyName: "Audio SRL" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01234567890" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01114601006", pec: "audio@pec.it" })).toBe(true);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01114601006", recipientCode: "ABC1234" })).toBe(true);
  });

  it("richiede sempre telefono e indirizzo", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private", taxCode: "RSSMRA80A01F205X", phone: "" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "private", taxCode: "RSSMRA80A01F205X", addressPostalCode: "2010" })).toBe(false);
  });

  it("richiede nome e cognome soltanto al privato", () => {
    expect(hasValidCustomerDetails({ ...base, customerType: "private", firstName: "", taxCode: "RSSMRA80A01F205X" })).toBe(false);
    expect(hasValidCustomerDetails({ ...base, customerType: "business", firstName: "", lastName: "", companyName: "Audio SRL", vatNumber: "01114601006", pec: "audio@pec.it" })).toBe(true);
  });
});
