"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const allowed: Record<string, string[]> = { received: ["in_review", "rejected", "cancelled"], in_review: ["received", "rejected", "cancelled"], confirmed: ["closed"] };
export async function updateRequestStatus(data: FormData) { const id=String(data.get("requestId")??""); const current=String(data.get("currentStatus")??""); const next=String(data.get("status")??""); const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/accesso"); const {data:staff}=await supabase.from("staff_profiles").select("role").eq("user_id",user.id).maybeSingle(); if(staff?.role!=="owner"||!allowed[current]?.includes(next)) redirect(`/area-riservata/pratiche/${id}?message=transizione-non-consentita`); const {data:request}=await supabase.from("requests").select("status").eq("id",id).maybeSingle(); if(!request||request.status!==current) redirect(`/area-riservata/pratiche/${id}?message=stato-aggiornato-da-altri`); const {error}=await supabase.from("requests").update({status:next}).eq("id",id); if(!error) await supabase.from("request_status_history").insert({request_id:id,previous_status:current,new_status:next,changed_by:user.id,note:String(data.get("note")??"")}); redirect(`/area-riservata/pratiche/${id}?message=${error?"errore":"stato-aggiornato"}`); }
export async function createQuoteFromRequest(data: FormData) {
  const requestId = String(data.get("requestId") ?? ""); const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle(); if (staff?.role !== "owner") redirect(`/area-riservata/pratiche/${requestId}?message=permesso-negato`);
  const { data: request } = await supabase.from("requests").select("status").eq("id", requestId).maybeSingle();
  if (!request || ["rejected", "cancelled", "closed"].includes(request.status)) redirect(`/area-riservata/pratiche/${requestId}?message=preventivo-non-consentito`);
  const { data: quote } = await supabase.from("quotes").upsert({ request_id: requestId }, { onConflict: "request_id" }).select("id").single(); if (!quote) redirect(`/area-riservata/pratiche/${requestId}?message=errore-preventivo`);
  const { data: revision } = await supabase.from("quote_revisions").select("id").eq("quote_id", quote.id).order("revision_number", { ascending: false }).limit(1).maybeSingle();
  if (!revision) await supabase.from("quote_revisions").insert({ quote_id: quote.id, revision_number: 1, status: "draft" });
  redirect(`/area-riservata/pratiche/${requestId}?message=preventivo-creato`);
}
