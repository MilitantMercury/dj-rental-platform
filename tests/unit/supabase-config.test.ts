import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig, SUPABASE_TEST_PROJECT_REF, SUPABASE_TEST_URL } from "@/lib/supabase/config";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe("configurazione Supabase", () => {
  it("registra il solo riferimento pubblico TEST", () => {
    expect(SUPABASE_TEST_PROJECT_REF).toBe("ghnlclmckxaoqptlkelr");
    expect(SUPABASE_TEST_URL).toBe("https://ghnlclmckxaoqptlkelr.supabase.co");
  });

  it("rifiuta una configurazione incompleta", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(() => getSupabasePublicConfig()).toThrow("Configurazione pubblica Supabase mancante.");
  });
});
