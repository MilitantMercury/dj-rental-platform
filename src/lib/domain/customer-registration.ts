export type CustomerType = "private" | "business";

export const normalizeTaxCode = (value: string) => value.trim().replace(/\s/g, "").toUpperCase();
export const normalizeVatNumber = (value: string) => value.replace(/\D/g, "");
export const normalizeRecipientCode = (value: string) => value.trim().replace(/\s/g, "").toUpperCase();
export const normalizePec = (value: string) => value.trim().toLowerCase();

const oddValues: Record<string, number> = { 0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21, A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23 };

export function isValidTaxCode(value: string) {
  const taxCode = normalizeTaxCode(value);
  if (!/^[A-Z0-9]{16}$/.test(taxCode)) return false;
  const sum = [...taxCode.slice(0, 15)].reduce((total, character, index) => {
    const evenValue = /^[0-9]$/.test(character) ? Number(character) : character.charCodeAt(0) - 65;
    return total + (index % 2 === 0 ? oddValues[character] : evenValue);
  }, 0);
  return taxCode[15] === String.fromCharCode(65 + (sum % 26));
}

export function isValidVatNumber(value: string) {
  const vatNumber = normalizeVatNumber(value);
  if (!/^\d{11}$/.test(vatNumber)) return false;
  const sum = [...vatNumber.slice(0, 10)].reduce((total, character, index) => {
    const digit = Number(character);
    return total + (index % 2 === 0 ? digit : digit * 2 > 9 ? digit * 2 - 9 : digit * 2);
  }, 0);
  return Number(vatNumber[10]) === (10 - (sum % 10)) % 10;
}

export const isValidPec = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizePec(value));
export const isValidRecipientCode = (value: string) => /^[A-Z0-9]{7}$/.test(normalizeRecipientCode(value));
export const hasValidStructuredAddress = (input: { street: string; number: string; postalCode: string; city: string; province: string; country: string }) => Boolean(input.street && input.number && /^\d{5}$/.test(input.postalCode) && input.city && /^[A-Z]{2}$/.test(input.province) && input.country);

export function hasValidCustomerDetails(input: {
  customerType: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressStreet: string;
  addressNumber: string;
  addressPostalCode: string;
  addressCity: string;
  addressProvince: string;
  addressCountry: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  pec: string;
  recipientCode: string;
}) {
  if (!["private", "business"].includes(input.customerType)) return false;
  if (input.phone.length < 6 || !hasValidStructuredAddress({ street: input.addressStreet, number: input.addressNumber, postalCode: input.addressPostalCode, city: input.addressCity, province: input.addressProvince, country: input.addressCountry })) return false;
  if (input.customerType === "private") {
    return Boolean(input.firstName && input.lastName && isValidTaxCode(input.taxCode));
  }

  return Boolean(
    input.companyName &&
    isValidVatNumber(input.vatNumber) &&
      (isValidPec(input.pec) || isValidRecipientCode(input.recipientCode)),
  );
}
