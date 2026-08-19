export type RequestedQuoteLine = { id: string; quantity: number };
export type DraftQuoteLine = { sourceRequestItemId: string; quantity: number };

export function hasExactRequestedQuantities(
  requested: RequestedQuoteLine[],
  draft: DraftQuoteLine[],
) {
  if (!requested.length || !draft.length) return false;
  const requestedById = new Map(requested.map((item) => [item.id, item.quantity]));
  const draftedById = new Map<string, number>();

  for (const line of draft) {
    if (!requestedById.has(line.sourceRequestItemId) || !Number.isInteger(line.quantity) || line.quantity < 1) return false;
    draftedById.set(line.sourceRequestItemId, (draftedById.get(line.sourceRequestItemId) ?? 0) + line.quantity);
  }

  return [...requestedById].every(([id, quantity]) => draftedById.get(id) === quantity);
}
