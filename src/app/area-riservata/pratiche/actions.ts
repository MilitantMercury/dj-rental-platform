"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const allowed: Record<string, string[]> = { received: ["in_review", "rejected", "cancelled"], in_review: ["received", "rejected", "cancelled"] };
export async function updateRequestStatus(data: FormData) {
  const id = String(data.get("requestId") ?? ""), current = String(data.get("currentStatus") ?? ""), next = String(data.get("status") ?? "");
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", auth.user.id).maybeSingle();
  if (!staff || !allowed[current]?.includes(next)) redirect(`/area-riservata/pratiche/${id}?message=transizione-non-consentita`);
  const { data: request } = await supabase.from("requests").select("status").eq("id", id).maybeSingle();
  if (!request || request.status !== current) redirect(`/area-riservata/pratiche/${id}?message=stato-aggiornato-da-altri`);
  const { error } = await supabase.from("requests").update({ status: next as "received" | "in_review" | "rejected" | "cancelled" }).eq("id", id);
  if (!error) await supabase.from("request_status_history").insert({ request_id: id, previous_status: current, new_status: next, changed_by: auth.user.id, note: String(data.get("note") ?? "") });
  redirect(`/area-riservata/pratiche/${id}?message=${error ? "errore" : "stato-aggiornato"}`);
}
