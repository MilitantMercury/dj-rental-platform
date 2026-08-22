import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/area-riservata/catalogo/gallery-actions", () => ({ moveProductImage: vi.fn(), reorderProductImages: vi.fn(), removeProductImage: vi.fn(), setProductCover: vi.fn() }));
import { ProductGalleryManager } from "@/components/product-gallery-manager";

describe("gestione galleria prodotto", () => {
  it("identifica la copertina e consente copertina/rimozione sulle altre immagini", () => {
    render(<ProductGalleryManager productId="product-1" images={[
      { id: "image-1", storage_path: "products/a/one.webp", alt_text: "Frontale", sort_order: 0 },
      { id: "image-2", storage_path: "products/a/two.webp", alt_text: "Retro", sort_order: 1 },
    ]} />);
    expect(screen.getByText(/Copertina/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Usa come copertina" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Rimuovi" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Sposta immagine/ })).toHaveLength(4);
  });
});
