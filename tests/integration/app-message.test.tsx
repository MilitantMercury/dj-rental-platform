import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppMessage } from "@/components/app-message";

afterEach(cleanup);

describe("messaggio applicativo", () => {
  it("presenta gli esiti positivi senza mostrare chiavi tecniche", () => {
    render(<AppMessage message="pratica-chiusa" />);
    expect(screen.getByRole("status")).toHaveTextContent("Pratica chiusa correttamente.");
    expect(screen.queryByText("pratica-chiusa")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chiudi notifica" })).toBeInTheDocument();
  });

  it("nasconde automaticamente gli esiti positivi", () => {
    vi.useFakeTimers();
    render(<AppMessage message="bozza-salvata" />);
    act(() => vi.advanceTimersByTime(4500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("annuncia gli errori in modo immediato", () => {
    render(<AppMessage message="pubblicazione-non-riuscita" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Pubblicazione non riuscita.");
    expect(screen.getByRole("alert")).toHaveClass("app-message-toast");
    expect(screen.getByRole("button", { name: "Chiudi notifica" })).toBeInTheDocument();
  });
});
