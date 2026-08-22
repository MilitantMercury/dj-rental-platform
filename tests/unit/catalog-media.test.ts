import { describe, expect, it } from "vitest";
import { catalogImagePath, catalogMediaUrl, validateCatalogImage } from "@/lib/catalog-media";

describe("media catalogo", () => {
  it("accetta i formati immagine previsti e costruisce percorsi confinati", () => {
    const file = new File(["image"], "console.webp", { type: "image/webp" });
    const result = validateCatalogImage(file);
    expect(result.error).toBeNull();
    expect(catalogImagePath("products", "10000000-0000-0000-0000-000000000001", result.extension!, "20000000-0000-0000-0000-000000000002"))
      .toBe("products/10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000002.webp");
  });

  it("rifiuta file non immagine e file oltre 5 MB", () => {
    expect(validateCatalogImage(new File(["text"], "note.txt", { type: "text/plain" })).error).toMatch(/Formato/);
    expect(validateCatalogImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" })).error).toMatch(/5 MB/);
  });

  it("espone i file tramite la route media locale", () => {
    expect(catalogMediaUrl("categories/a/b.jpg")).toBe("/catalog-media/categories/a/b.jpg");
    expect(catalogMediaUrl(null)).toBeNull();
  });
});
