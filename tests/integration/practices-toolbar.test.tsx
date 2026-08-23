import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PracticesToolbar } from "@/components/practices-toolbar";

afterEach(cleanup);

describe("barra strumenti pratiche", () => {
  it("separa il comando owner dalla navigazione tra viste", () => {
    render(
      <PracticesToolbar
        activeCount={2}
        archivedCount={4}
        isArchiveView={false}
        expireAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: "Strumenti pratiche" })).toBeVisible();
    expect(screen.getByText("Scadenze opzioni")).toBeVisible();
    expect(screen.getByRole("button", { name: "Aggiorna opzioni scadute" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Viste delle pratiche" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Da gestire 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Archivio 4" })).not.toHaveAttribute("aria-current");
  });

  it("non mostra il comando operativo ai non owner", () => {
    render(
      <PracticesToolbar activeCount={1} archivedCount={0} isArchiveView />,
    );

    expect(screen.queryByText("Scadenze opzioni")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Archivio 0" })).toHaveAttribute("aria-current", "page");
  });
});
