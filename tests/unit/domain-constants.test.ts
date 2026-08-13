import { describe, expect, it } from "vitest";
import {
  APP_CURRENCY,
  APP_LOCALE,
  APP_TIME_ZONE,
  USER_ROLE_LABELS,
  USER_ROLES,
} from "@/lib/domain/constants";

describe("costanti di dominio", () => {
  it("usa localizzazione, valuta e fuso orario approvati", () => {
    expect(APP_LOCALE).toBe("it-IT");
    expect(APP_CURRENCY).toBe("EUR");
    expect(APP_TIME_ZONE).toBe("Europe/Rome");
  });

  it("espone soltanto i ruoli iniziali approvati", () => {
    expect(USER_ROLES).toEqual(["customer", "collaborator", "owner"]);
    expect(USER_ROLE_LABELS).toEqual({
      customer: "Cliente",
      collaborator: "Collaboratore",
      owner: "Owner",
    });
  });
});
