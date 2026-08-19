"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function respondToQuote(data: FormData) {
  const revisionId = String(data.get("revisionId") ?? "");
  const outcome = String(data.get("outcome") ?? "");
  const comment = String(data.get("comment") ?? "").trim();
  if (!revisionId || !["accepted", "rejected", "changes_requested"].includes(outcome)) {
    redirect("/area-riservata/preventivi?message=risposta-non-valida");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");

  const { error } = await supabase.rpc("respond_to_current_quote", {
    p_revision_id: revisionId,
    p_outcome: outcome,
    p_comment: comment,
  });
  redirect(`/area-riservata/preventivi?message=${error ? "risposta-non-disponibile" : "risposta-registrata"}`);
}
