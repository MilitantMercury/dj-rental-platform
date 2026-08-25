import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/area-riservata/catalogo/media-actions", () => ({ uploadCatalogImage: vi.fn() }));
import { CatalogImageUpload } from "@/components/catalog-image-upload";

describe("caricamento immagini catalogo", () => {
  afterEach(cleanup);

  it("limita il selettore ai formati supportati e richiede il file", () => {
    render(<CatalogImageUpload kind="services" entityId="10000000-0000-0000-0000-000000000001" label="DJ set" />);
    const input = screen.getByLabelText(/^Immagine di DJ set/);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp,image/avif");
    expect(screen.getByRole("button", { name: "Carica immagine" })).toBeVisible();
    expect(screen.getByLabelText(/^Descrizione dell’immagine/)).toHaveValue("DJ set");
    expect(screen.getByText(/lettori vocali/i)).toBeVisible();
  });

  it("presenta l’aggiunta alla galleria quando il prodotto ha già una copertina", () => {
    render(<CatalogImageUpload kind="products" entityId="10000000-0000-0000-0000-000000000001" label="Console" hasImage initialAlt="Console vista dall’alto" />);
    expect(screen.getByLabelText(/^Aggiungi un’immagine alla galleria/)).toBeRequired();
    expect(screen.getByRole("button", { name: "Aggiungi alla galleria" })).toBeVisible();
    expect(screen.getByText(/massimo 5 immagini/i)).toBeVisible();
    expect(screen.getByLabelText(/^Descrizione dell’immagine/)).toHaveValue("Console vista dall’alto");
  });
});
