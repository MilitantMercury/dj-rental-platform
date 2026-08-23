import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FormFeedbackBridge, FORM_SCROLL_STORAGE_KEY } from "@/components/form-feedback-bridge";

afterEach(() => window.sessionStorage.clear());

describe("persistenza posizione dopo salvataggio", () => {
  it("memorizza la posizione quando viene inviato un form", () => {
    const { getByRole } = render(<><FormFeedbackBridge /><form><button type="submit">Salva</button></form></>);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 640 });
    fireEvent.submit(getByRole("button", { name: "Salva" }).closest("form")!);
    expect(JSON.parse(window.sessionStorage.getItem(FORM_SCROLL_STORAGE_KEY) ?? "{}")).toMatchObject({ pathname: window.location.pathname, scrollY: 640 });
  });
});
