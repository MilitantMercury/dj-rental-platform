export function preparationItemStatus({
  expectedQuantity,
  preparedQuantity,
  deliveredQuantity,
  returnedQuantity,
}: {
  expectedQuantity: number;
  preparedQuantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
}) {
  if (returnedQuantity === expectedQuantity && expectedQuantity > 0) return "returned";
  if (deliveredQuantity === expectedQuantity && expectedQuantity > 0) return "delivered";
  if (preparedQuantity === expectedQuantity && expectedQuantity > 0) return "prepared";
  return "pending";
}
