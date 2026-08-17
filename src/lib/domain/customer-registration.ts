export type CustomerType = "private" | "business";

export function hasValidCustomerDetails(input: {
  customerType: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  pec: string;
  recipientCode: string;
}) {
  if (!["private", "business"].includes(input.customerType)) return false;
  if (input.phone.length < 6 || !input.address) return false;
  if (input.customerType === "private") {
    return Boolean(input.firstName && input.lastName && input.taxCode);
  }

  return Boolean(
    input.companyName &&
      input.vatNumber &&
      (input.pec || input.recipientCode),
  );
}
