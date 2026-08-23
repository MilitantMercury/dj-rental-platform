import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  return createClient(getSupabasePublicConfig().url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
