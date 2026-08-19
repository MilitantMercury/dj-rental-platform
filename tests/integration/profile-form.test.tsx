import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CustomerProfileForm } from "@/app/area-riservata/profilo/profile-form";

const initial = {
  customerType: "private" as const,
  firstName: "Mario",
  lastName: "Rossi",
  email: "mario@example.test",
  phone: "3331234567",
  addressLegacy: "Via Roma 1",
  addressStreet: "",
  addressNumber: "",
  addressPostalCode: "",
  addressCity: "",
  addressProvince: "",
  addressCountry: "Italia",
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
    expect(screen.getByText(/Indirizzo attuale: Via Roma 1/)).toBeInTheDocument();
    expect(screen.getByLabelText("CAP")).toBeRequired();
    expect(screen.getByLabelText("Provincia")).toHaveDisplayValue("Seleziona");
    expect(screen.getByRole("option", { name: "Milano" })).toHaveValue("MI");
    expect(screen.getByLabelText("Nazione: Italia")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Nazione" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ragione sociale")).not.toBeInTheDocument();
  });

  it("mantiene bloccato il tipo cliente e mostra i dati pertinenti", () => {
    const { container } = render(<CustomerProfileForm initial={{ ...initial, customerType: "business", companyName: "Audio SRL", vatNumber: "01234567890" }} />);

    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    expect(container.querySelector("#customerType")).toBeDisabled();
    expect(screen.getByLabelText("Ragione sociale")).toBeRequired();
    expect(screen.getByLabelText("PEC")).toBeRequired();
    expect(screen.getByLabelText("Codice destinatario")).toBeRequired();

    fireEvent.input(screen.getByLabelText("PEC"), {
      target: { value: "audio@example.test" },
    });

    expect(screen.getByLabelText("Codice destinatario")).not.toBeRequired();
  });
});
