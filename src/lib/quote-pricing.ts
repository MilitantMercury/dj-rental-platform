export function euroToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function calculateQuoteTotals(
  itemTotals: number[],
  discountCents: number,
) {
  const subtotalCents = itemTotals.reduce((sum, total) => sum + total, 0);

  if (discountCents < 0 || discountCents > subtotalCents) return null;

  return {
    subtotalCents,
    totalCents: subtotalCents - discountCents,
  };
}
