import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CatalogSlugFields } from "@/components/catalog-slug-fields";

describe("slug catalogo", () => {
  afterEach(cleanup);

  it("lo genera dal nome rimuovendo accenti e caratteri non validi", () => {
    render(<CatalogSlugFields />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Console DJ Èlite 4+" } });
    expect(screen.getByLabelText(/^Indirizzo pagina \(slug\)/)).toHaveValue("console-dj-elite-4");
  });

  it("resta modificabile e normalizza il valore personalizzato", () => {
    render(<CatalogSlugFields />);
    const slug = screen.getByLabelText(/^Indirizzo pagina \(slug\)/);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Console DJ" } });
    fireEvent.change(slug, { target: { value: "Offerta Speciale 2026" } });
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Nome cambiato" } });
    expect(slug).toHaveValue("offerta-speciale-2026");
    expect(screen.getByText(/lettere minuscole, numeri e trattini/i)).toBeVisible();
  });
});
