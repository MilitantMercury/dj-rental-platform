export type FinancialSummaryRecord = {
  record_type: string;
  amount_cents: number;
};

export function calculateFinancialSummary(
  quoteTotalCents: number,
  records: FinancialSummaryRecord[],
) {
  const rentalCollectedCents = records.reduce(
    (total, record) => total + (record.record_type === "advance_received" || record.record_type === "balance_received" ? record.amount_cents : 0),
    0,
  );
  const depositHeldCents = records.reduce(
    (total, record) => total + (record.record_type === "deposit_received" ? record.amount_cents : record.record_type === "deposit_returned" ? -record.amount_cents : 0),
    0,
  );
  const cashCollectedCents = records.reduce(
    (total, record) => total + (
      record.record_type === "deposit_received" || record.record_type === "advance_received" || record.record_type === "balance_received"
        ? record.amount_cents
        : record.record_type === "deposit_returned"
          ? -record.amount_cents
          : 0
    ),
    0,
  );

  return {
    cashCollectedCents,
    rentalCollectedCents,
    rentalOutstandingCents: Math.max(quoteTotalCents - rentalCollectedCents, 0),
    depositToReturnCents: Math.max(depositHeldCents, 0),
  };
}
