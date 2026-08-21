export const FINANCIAL_RECORD_TYPES = [
  "deposit_received",
  "deposit_returned",
  "advance_received",
  "balance_received",
  "adjustment",
] as const;

export type FinancialRecordType = (typeof FINANCIAL_RECORD_TYPES)[number];

const labels: Record<FinancialRecordType, string> = {
  deposit_received: "Caparra incassata",
  deposit_returned: "Caparra restituita",
  advance_received: "Acconto incassato",
  balance_received: "Saldo incassato",
  adjustment: "Rettifica",
};

export function isFinancialRecordType(value: string): value is FinancialRecordType {
  return FINANCIAL_RECORD_TYPES.some((type) => type === value);
}

export function financialRecordLabel(value: string) {
  return isFinancialRecordType(value) ? labels[value] : "Registrazione";
}
