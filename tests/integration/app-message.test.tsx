import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppMessage } from "@/components/app-message";

afterEach(cleanup);

describe("messaggio applicativo", () => {
  it("presenta gli esiti positivi senza mostrare chiavi tecniche", () => {
    render(<AppMessage message="pratica-chiusa" />);
    expect(screen.getByRole("status")).toHaveTextContent("Pratica chiusa correttamente.");
    expect(screen.queryByText("pratica-chiusa")).not.toBeInTheDocument();
  });

  it("annuncia gli errori in modo immediato", () => {
    render(<AppMessage message="pubblicazione-non-riuscita" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Pubblicazione non riuscita.");
  });
});
