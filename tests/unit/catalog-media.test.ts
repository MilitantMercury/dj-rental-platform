import { describe, expect, it } from "vitest";
import { catalogImagePath, catalogMediaUrl, hasValidCatalogImageSignature, optimizeCatalogImage, validateCatalogImage } from "@/lib/catalog-media";

describe("media catalogo", () => {
  it("accetta i formati immagine previsti e costruisce percorsi confinati", () => {
    const file = new File(["image"], "console.webp", { type: "image/webp" });
    const result = validateCatalogImage(file);
    expect(result.error).toBeNull();
    expect(catalogImagePath("products", "10000000-0000-0000-0000-000000000001", result.extension!, "20000000-0000-0000-0000-000000000002"))
      .toBe("products/10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000002.webp");
  });

  it("verifica la firma binaria oltre al MIME dichiarato", async () => {
    const sharp = (await import("sharp")).default;
    const pngBytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#000" } }).png().toBuffer();
    const png = new File([pngBytes], "valid.png", { type: "image/png" });
    const fake = new File(["not an image"], "fake.png", { type: "image/png" });
    expect(await hasValidCatalogImageSignature(png, "png")).toBe(true);
    expect(await hasValidCatalogImageSignature(fake, "png")).toBe(false);
  });
  it("accetta un AVIF realmente decodificabile", async () => {
    const sharp = (await import("sharp")).default;
    const avifBytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#000" } }).avif().toBuffer();
    const avif = new File([avifBytes], "compatible.avif", { type: "image/avif" });

    expect(await hasValidCatalogImageSignature(avif, "avif")).toBe(true);
  });
  it("accetta un formato reale consentito anche se estensione e MIME sono errati", async () => {
    const sharp = (await import("sharp")).default;
    const webpBytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#000" } }).webp().toBuffer();
    const renamed = new File([webpBytes], "renamed.jpg", { type: "image/jpeg" });

    expect(await hasValidCatalogImageSignature(renamed, "jpg")).toBe(true);
  });
  it("normalizza le immagini in WebP entro 2560 pixel senza ridurre sorgenti già adatte", async () => {
    const sharp = (await import("sharp")).default;
    const source = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: "#ff9900" } }).png().toBuffer();
    const optimized = await optimizeCatalogImage(new File([source], "hero.png", { type: "image/png" }));
    const metadata = await sharp(optimized).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(2400);
    expect(metadata.height).toBe(1200);
  });
  it("rifiuta immagini che diventerebbero sgranate nelle schede pubbliche", async () => {
    const sharp = (await import("sharp")).default;
    const source = await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#111" } }).png().toBuffer();

    await expect(optimizeCatalogImage(new File([source], "small.png", { type: "image/png" })))
      .rejects.toThrow(/almeno 1200 px/);
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
