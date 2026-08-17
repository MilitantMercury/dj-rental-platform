import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserMenu } from "@/components/user-menu";

describe("menu utente", () => {
  it("espone il collegamento al profilo personale", () => {
    render(<UserMenu name="Mario" role="Cliente" />);

    fireEvent.click(screen.getByText("Mario"));

    expect(screen.getByRole("link", { name: "Il mio profilo" })).toHaveAttribute(
      "href",
      "/area-riservata/profilo",
    );
  });
});
