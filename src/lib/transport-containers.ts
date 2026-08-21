export const TRANSPORT_CONTAINER_TYPES = ["flight_case", "cassa", "borsa", "altro"] as const;

export function isTransportContainerType(value: string) {
  return TRANSPORT_CONTAINER_TYPES.some((type) => type === value);
}

export function transportContainerLabel(value: string) {
  return ({ flight_case: "Flight case", cassa: "Cassa", borsa: "Borsa", altro: "Altro" } as Record<string, string>)[value] ?? "Contenitore";
}
