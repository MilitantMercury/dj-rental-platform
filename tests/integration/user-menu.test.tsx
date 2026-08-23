import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UserMenu } from "@/components/user-menu";

afterEach(cleanup);

describe("menu utente", () => {
  it("espone il collegamento al profilo personale", () => {
    render(<UserMenu name="Mario" role="Cliente" />);

    fireEvent.click(screen.getByText("Mario"));

    expect(screen.getByRole("link", { name: "Il mio profilo" })).toHaveAttribute(
      "href",
      "/area-riservata/profilo",
    );
  });

  it("mostra all’owner un menu personale essenziale", () => {
    render(<UserMenu name="Andrea" role="Owner" />);
    fireEvent.click(screen.getByText("Andrea"));
    expect(screen.getByRole("link", { name: "Area riservata" })).toHaveAttribute("href", "/area-riservata");
    expect(screen.getByRole("link", { name: "Impostazioni" })).toHaveAttribute("href", "/area-riservata/impostazioni");
    expect(screen.queryByRole("link", { name: "Pratiche" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Catalogo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Magazzino" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Le mie richieste" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "I miei preventivi" })).not.toBeInTheDocument();
  });

  it("non espone configurazione e magazzino al collaboratore", () => {
    render(<UserMenu name="Luca" role="Collaboratore" />);
    fireEvent.click(screen.getByText("Luca"));
    expect(screen.getByRole("link", { name: "Pratiche" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Magazzino" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Impostazioni" })).not.toBeInTheDocument();
  });
});
