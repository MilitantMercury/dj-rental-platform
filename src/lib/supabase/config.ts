export const SUPABASE_TEST_PROJECT_REF = "ghnlclmckxaoqptlkelr" as const;
export const SUPABASE_TEST_URL = `https://${SUPABASE_TEST_PROJECT_REF}.supabase.co`;

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Configurazione pubblica Supabase mancante.");
  return { url, publishableKey };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
