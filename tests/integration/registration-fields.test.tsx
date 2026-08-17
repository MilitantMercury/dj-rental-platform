import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RegistrationFields } from "@/components/registration-fields";

afterEach(cleanup);

describe("conferma password in registrazione", () => {
  it("segnala le password diverse e rimuove l'errore quando coincidono", () => {
    const { container } = render(<RegistrationFields />);

    const password = container.querySelector<HTMLInputElement>(
      'input[name="password"]',
    );
    const passwordConfirmation = container.querySelector<HTMLInputElement>(
      'input[name="passwordConfirmation"]',
    );

    if (!password || !passwordConfirmation) {
      throw new Error("I campi password non sono disponibili.");
    }

    fireEvent.input(password, {
      target: { value: "Password123" },
    });
    fireEvent.input(passwordConfirmation, {
      target: { value: "Password456" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Le password non coincidono.");
    expect(passwordConfirmation).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    fireEvent.input(passwordConfirmation, {
      target: { value: "Password123" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(passwordConfirmation).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
});
