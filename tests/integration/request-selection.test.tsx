import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RequestSelection } from "@/components/request-selection";

describe("riepilogo richiesta", () => {
  it("mostra prodotti, servizi, quantità e vincolo non prenotante", () => {
    render(<RequestSelection items={[{ id: "p1", name: "Console DJ", type: "product", quantity: 2 }, { id: "s1", name: "Tecnico", type: "service", quantity: 1 }]} />);
    expect(screen.getByRole("heading", { name: "Cosa includere nella proposta" })).toBeVisible();
    expect(screen.getByText("Console DJ")).toBeVisible();
    expect(screen.getByLabelText("Quantità 2")).toBeVisible();
    expect(screen.getByText("Tecnico")).toBeVisible();
    expect(screen.getByText(/non costituisce una prenotazione/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Modifica carrello" })).toHaveAttribute("href", "/carrello");
  });
});
