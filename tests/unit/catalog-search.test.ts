import { describe, expect, it } from "vitest";
import { matchesCatalogSearch } from "@/lib/catalog-search";
describe("ricerca catalogo", () => {
  const item = { name: "Cuffie professionali", description: "Audio per DJ", included_accessories: "Cavo jack" };
  it("cerca su più campi ignorando maiuscole e accenti", () => {
    expect(matchesCatalogSearch(item, "CUFFIE audio")).toBe(true);
    expect(matchesCatalogSearch({ name: "Tecnico", description: "Qualità audio" }, "qualita")).toBe(true);
  });
  it("richiede che tutte le parole siano presenti", () => expect(matchesCatalogSearch(item, "cuffie vocalist")).toBe(false));
});
