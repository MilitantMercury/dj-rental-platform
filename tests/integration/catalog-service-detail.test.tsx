import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/add-to-cart", () => ({ AddToCart: ({ name, type }: { name: string; type?: string }) => <button>{type}: {name}</button> }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));
import { CatalogServiceDetail } from "@/components/catalog-service-detail";

describe("dettaglio servizio pubblico", () => {
  it("mostra descrizione, condizioni e azioni senza prezzo interno", () => {
    render(<CatalogServiceDetail service={{ id: "service-1", name: "DJ Vocalist", description: "Musica e voce", conditions: "Durata da concordare", image_path: "services/dj.webp", image_alt: "DJ al mixer" }} categoryName="Intrattenimento" />);
    expect(screen.getByRole("heading", { level: 1, name: "DJ Vocalist" })).toBeInTheDocument();
    expect(screen.getByText("Musica e voce")).toBeInTheDocument();
    expect(screen.getByText("Descrizione")).toBeInTheDocument();
    expect(screen.getByText("Durata da concordare")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "service: DJ Vocalist" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Prepara la richiesta/ })).toHaveAttribute("href", "/richiesta");
    expect(screen.queryByText(/Prezzo indicativo/)).not.toBeInTheDocument();
  });
});
