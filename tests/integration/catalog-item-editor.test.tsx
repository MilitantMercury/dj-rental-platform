import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/area-riservata/catalogo/actions", () => ({ updateCatalogItem: vi.fn() }));
import { CatalogItemEditor } from "@/components/catalog-item-editor";

describe("editor catalogo", () => {
  it("espone i campi prodotto e l'anteprima privata", () => {
    render(<CatalogItemEditor table="products" categories={[{ id: "cat-1", name: "Audio" }]} item={{ id: "product-1", name: "Console", slug: "console", description: "Mixer", category_id: "cat-1", reference_price_cents: 10000, included_accessories: "Cavo" }} />);
    expect(screen.getByDisplayValue("Console")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cavo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apri anteprima" })).toHaveAttribute("href", "/area-riservata/catalogo/anteprima/products/product-1");
  });
});