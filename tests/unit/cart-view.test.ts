import { describe, expect, it } from "vitest";
import { buildCartViewItems } from "@/lib/cart-view";

describe("vista del carrello", () => {
  it("associa al prodotto la prima immagine ordinata ricevuta", () => {
    const [item] = buildCartViewItems(
      [{ id: "row-1", item_type: "product", quantity: 2, product_id: "product-1", service_id: null }],
      [{ id: "product-1", name: "Console DJ" }],
      [],
      [
        { product_id: "product-1", storage_path: "products/product-1/cover.webp", alt_text: "Console vista frontale" },
        { product_id: "product-1", storage_path: "products/product-1/detail.webp", alt_text: "Dettaglio console" },
      ],
    );

    expect(item).toMatchObject({
      name: "Console DJ",
      quantity: 2,
      imageUrl: "/catalog-media/products/product-1/cover.webp",
      imageAlt: "Console vista frontale",
    });
  });

  it("usa un fallback senza immagine per i servizi", () => {
    const [item] = buildCartViewItems(
      [{ id: "row-2", item_type: "service", quantity: 1, product_id: null, service_id: "service-1" }],
      [],
      [{ id: "service-1", name: "DJ vocalist" }],
      [],
    );

    expect(item).toMatchObject({ name: "DJ vocalist", imageUrl: null, imageAlt: "DJ vocalist" });
  });
});
