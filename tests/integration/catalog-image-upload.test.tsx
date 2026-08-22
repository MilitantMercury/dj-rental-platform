import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/area-riservata/catalogo/media-actions", () => ({ uploadCatalogImage: vi.fn() }));
import { CatalogImageUpload } from "@/components/catalog-image-upload";

describe("caricamento immagini catalogo", () => {
  it("limita il selettore ai formati supportati e richiede il file", () => {
    render(<CatalogImageUpload kind="services" entityId="10000000-0000-0000-0000-000000000001" label="DJ set" />);
    const input = screen.getByLabelText("Immagine di DJ set");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp,image/avif");
    expect(screen.getByRole("button", { name: "Carica immagine" })).toBeVisible();
  });
});
