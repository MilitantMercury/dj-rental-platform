import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/area-riservata/catalogo/actions", () => ({ moveCatalogItem: vi.fn(), toggleCatalogItem: vi.fn(), toggleCatalogPublication: vi.fn() }));
import { CatalogItemControls } from "@/components/catalog-item-controls";

describe("controlli pubblicazione catalogo", () => {
  it("distingue bozza e pubblicazione e offre un ordine accessibile", () => {
    render(<CatalogItemControls table="products" id="10000000-0000-0000-0000-000000000001" active published={false} first last={false} />);
    expect(screen.getByText("Bozza")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pubblica" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sposta prima" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sposta dopo" })).toBeEnabled();
  });
});