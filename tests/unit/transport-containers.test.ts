import { describe, expect, it } from "vitest";
import { isTransportContainerType, transportContainerLabel } from "@/lib/transport-containers";

describe("contenitori di trasporto", () => {
  it("accetta solo le tipologie non serializzate previste", () => {
    expect(isTransportContainerType("flight_case")).toBe(true);
    expect(isTransportContainerType("serial_number")).toBe(false);
  });

  it("mostra etichette operative italiane", () => {
    expect(transportContainerLabel("borsa")).toBe("Borsa");
  });
});
