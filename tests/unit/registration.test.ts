import { describe, expect, it } from "vitest";
import { isDuplicateRegistration } from "@/lib/domain/registration";

describe("registrazione con email esistente", () => {
  it("riconosce l'errore esplicito di Supabase", () => {
    expect(
      isDuplicateRegistration({
        errorCode: "user_already_exists",
        errorMessage: "User already registered",
      }),
    ).toBe(true);
  });

  it("riconosce la risposta anonimizzata per un account esistente", () => {
    expect(isDuplicateRegistration({ identities: [] })).toBe(true);
  });

  it("non scambia una nuova registrazione per un duplicato", () => {
    expect(isDuplicateRegistration({ identities: [{}] })).toBe(false);
  });
});
