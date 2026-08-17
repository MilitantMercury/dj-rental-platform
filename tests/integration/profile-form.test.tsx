import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CustomerProfileForm } from "@/app/area-riservata/profilo/profile-form";

const initial = {
  customerType: "private" as const,
  firstName: "Mario",
  lastName: "Rossi",
  email: "mario@example.test",
  phone: "3331234567",
  address: "Via Roma 1",
  companyName: "",
  taxCode: "RSSMRA80A01F205X",
  vatNumber: "",
  pec: "",
  recipientCode: "",
};

afterEach(cleanup);

describe("modulo del profilo cliente", () => {
  it("mostra i dati personali al cliente privato", () => {
    render(<CustomerProfileForm initial={initial} />);

    expect(screen.getByLabelText("Nome")).toBeRequired();
    expect(screen.getByLabelText("Cognome")).toBeRequired();
    expect(screen.getByLabelText("Codice fiscale")).toBeRequired();
    expect(screen.queryByLabelText("Ragione sociale")).not.toBeInTheDocument();
  });

  it("mostra i dati aziendali e richiede PEC oppure codice destinatario", () => {
    render(<CustomerProfileForm initial={initial} />);

    fireEvent.change(screen.getByLabelText("Tipo cliente"), {
      target: { value: "business" },
    });

    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Ragione sociale")).toBeRequired();
    expect(screen.getByLabelText("PEC")).toBeRequired();
    expect(screen.getByLabelText("Codice destinatario")).toBeRequired();

    fireEvent.input(screen.getByLabelText("PEC"), {
      target: { value: "audio@example.test" },
    });

    expect(screen.getByLabelText("Codice destinatario")).not.toBeRequired();
  });
});
