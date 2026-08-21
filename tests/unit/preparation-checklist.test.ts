import { describe, expect, it } from "vitest";
import { preparationItemStatus } from "@/lib/preparation-checklist";

describe("checklist di preparazione", () => {
  it("usa lo stato più avanzato raggiunto dal materiale", () => {
    expect(preparationItemStatus({ expectedQuantity: 2, preparedQuantity: 2, deliveredQuantity: 0, returnedQuantity: 0 })).toBe("prepared");
    expect(preparationItemStatus({ expectedQuantity: 2, preparedQuantity: 2, deliveredQuantity: 2, returnedQuantity: 0 })).toBe("delivered");
    expect(preparationItemStatus({ expectedQuantity: 2, preparedQuantity: 2, deliveredQuantity: 2, returnedQuantity: 2 })).toBe("returned");
  });

  it("mantiene il materiale parziale nello stato da preparare", () => {
    expect(preparationItemStatus({ expectedQuantity: 3, preparedQuantity: 2, deliveredQuantity: 0, returnedQuantity: 0 })).toBe("pending");
  });
});
