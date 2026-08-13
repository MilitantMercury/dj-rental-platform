import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("pagina iniziale", () => {
  it("presenta il servizio in italiano senza promettere prenotazioni automatiche", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Il tuo evento,\s*con il suono giusto\./,
    );
    expect(screen.getByText(/non equivale a una prenotazione/i)).toBeVisible();
  });
});
