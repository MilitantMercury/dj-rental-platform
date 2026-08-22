export function euroToCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const normalized = raw.includes(",")
    ? /^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^\d+(?:,\d{1,2})?$/.test(raw)
      ? raw.replaceAll(".", "").replace(",", ".")
      : ""
    : /^\d+(?:\.\d{1,2})?$/.test(raw)
      ? raw
      : /^\d{1,3}(?:\.\d{3})+$/.test(raw)
        ? raw.replaceAll(".", "")
        : "";
  if (!normalized) return null;
  return Math.round(Number(normalized) * 100);
}

export function formatEuroInput(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(cents / 100);
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
