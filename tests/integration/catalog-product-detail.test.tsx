import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/add-to-cart", () => ({ AddToCart: ({ name }: { name: string }) => <button>Aggiungi {name}</button> }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));
import { CatalogProductDetail } from "@/components/catalog-product-detail";

describe("dettaglio prodotto pubblico", () => {
  it("mostra contenuti pubblici, dotazione e azioni senza prezzo interno", () => {
    render(<CatalogProductDetail product={{ id: "product-1", name: "Console DJ Hercules", description: "Console professionale", included_accessories: "Cavo audio" }} categoryName="Console DJ" image={{ storage_path: "products/console.webp", alt_text: "Console vista frontale" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Console DJ Hercules" })).toBeInTheDocument();
    expect(screen.getByText("Console professionale")).toBeInTheDocument();
    expect(screen.getByText("Descrizione")).toBeInTheDocument();
    expect(screen.getByText("Materiale incluso")).toBeInTheDocument();
    expect(screen.getByText("Cavo audio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aggiungi Console DJ Hercules" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Prepara la richiesta/ })).toHaveAttribute("href", "/richiesta");
    expect(screen.queryByText(/Prezzo indicativo/)).not.toBeInTheDocument();
  });
});
