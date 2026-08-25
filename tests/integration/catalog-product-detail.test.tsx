import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/add-to-cart", () => ({ AddToCart: ({ name }: { name: string }) => <button>Aggiungi {name}</button> }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));
import { CatalogProductDetail } from "@/components/catalog-product-detail";

describe("dettaglio prodotto pubblico", () => {
  it("mostra contenuti pubblici e azioni senza esporre prezzi", () => {
    render(<CatalogProductDetail product={{ id: "product-1", name: "Console DJ Hercules", description: "Console professionale", included_accessories: "Accessori inclusi: alimentatore e cavo audio" }} categoryName="Console DJ" images={[
      { id: "image-1", storage_path: "products/console-front.webp", alt_text: "Console vista frontale" },
      { id: "image-2", storage_path: "products/console-back.webp", alt_text: "Console vista posteriore" },
    ]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Console DJ Hercules" })).toBeInTheDocument();
    expect(screen.getByText("Console professionale")).toBeInTheDocument();
    expect(screen.getByText("Descrizione")).toBeInTheDocument();
    expect(screen.getByText("Materiale incluso")).toBeInTheDocument();
    expect(screen.getByText("Accessori inclusi: alimentatore e cavo audio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aggiungi Console DJ Hercules" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Immagine precedente" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Immagine successiva" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mostra immagine 2: Console vista posteriore" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Prepara la richiesta/ })).toHaveAttribute("href", "/richiesta");
    expect(screen.queryByText(/prezzo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/100 €/)).not.toBeInTheDocument();
  });
});
