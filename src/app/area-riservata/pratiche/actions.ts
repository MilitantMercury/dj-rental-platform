"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { euroToCents } from "@/lib/quote-pricing";
import { hasExactRequestedQuantities } from "@/lib/quote-lines";
const allowed: Record<string, string[]> = { received: ["in_review", "rejected", "cancelled"], in_review: ["received", "rejected", "cancelled"], accepted: ["confirmed"], confirmed: ["closed"] };
export async function updateRequestStatus(data: FormData) { const id=String(data.get("requestId")??""); const current=String(data.get("currentStatus")??""); const next=String(data.get("status")??""); const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/accesso"); const {data:staff}=await supabase.from("staff_profiles").select("role").eq("user_id",user.id).maybeSingle(); if(staff?.role!=="owner"||!allowed[current]?.includes(next)) redirect(`/area-riservata/pratiche/${id}?message=transizione-non-consentita`); const {data:request}=await supabase.from("requests").select("status").eq("id",id).maybeSingle(); if(!request||request.status!==current) redirect(`/area-riservata/pratiche/${id}?message=stato-aggiornato-da-altri`); const {error}=await supabase.from("requests").update({status:next}).eq("id",id); if(!error) await supabase.from("request_status_history").insert({request_id:id,previous_status:current,new_status:next,changed_by:user.id,note:String(data.get("note")??"")}); redirect(`/area-riservata/pratiche/${id}?message=${error?"errore":"stato-aggiornato"}`); }
export async function createQuoteFromRequest(data: FormData) {
  const requestId = String(data.get("requestId") ?? ""); const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle(); if (staff?.role !== "owner") redirect(`/area-riservata/pratiche/${requestId}?message=permesso-negato`);
  const { data: request } = await supabase.from("requests").select("status").eq("id", requestId).maybeSingle();
  if (!request || ["rejected", "cancelled", "closed"].includes(request.status)) redirect(`/area-riservata/pratiche/${requestId}?message=preventivo-non-consentito`);
  const { data: quote } = await supabase.from("quotes").upsert({ request_id: requestId }, { onConflict: "request_id" }).select("id").single(); if (!quote) redirect(`/area-riservata/pratiche/${requestId}?message=errore-preventivo`);
  const { data: revision } = await supabase.from("quote_revisions").select("id,revision_number,status").eq("quote_id", quote.id).order("revision_number", { ascending: false }).limit(1).maybeSingle();
  if (!revision) {
    await supabase.from("quote_revisions").insert({ quote_id: quote.id, revision_number: 1, status: "draft" });
    await supabase.from("requests").update({ status: "quote_draft" }).eq("id", requestId);
    await supabase.from("request_status_history").insert({ request_id: requestId, previous_status: request.status, new_status: "quote_draft", changed_by: user.id, note: "Bozza preventivo creata." });
  } else if (request.status === "changes_requested" && revision.status === "published") {
    const { data: nextRevision } = await supabase
      .from("quote_revisions")
      .insert({ quote_id: quote.id, revision_number: revision.revision_number + 1, status: "draft" })
      .select("id")
      .single();
    if (!nextRevision) redirect(`/area-riservata/pratiche/${requestId}?message=errore-preventivo`);
    const { data: previousItems } = await supabase
      .from("quote_items")
      .select("source_request_item_id,description,quantity,unit_price_cents,total_cents,sort_order")
      .eq("revision_id", revision.id)
      .order("sort_order");
    if (previousItems?.length) {
      const { error: copyError } = await supabase.from("quote_items").insert(previousItems.map((item) => ({ ...item, revision_id: nextRevision.id })));
      if (copyError) redirect(`/area-riservata/pratiche/${requestId}?message=errore-preventivo`);
    }
    await supabase.from("requests").update({ status: "quote_draft" }).eq("id", requestId);
    await supabase.from("request_status_history").insert({ request_id: requestId, previous_status: request.status, new_status: "quote_draft", changed_by: user.id, note: `Nuova revisione del preventivo creata (revisione ${revision.revision_number + 1}).` });
  }
  redirect(`/area-riservata/pratiche/${requestId}/preventivo`);
}

async function requireOwner(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect(`/area-riservata/pratiche/${requestId}?message=permesso-negato`);
  return supabase;
}

export async function saveQuoteDraft(data: FormData) {
  const requestId = String(data.get("requestId") ?? ""); const revisionId = String(data.get("revisionId") ?? "");
  const supabase = await requireOwner(requestId);
  const sourceItemIds = data.getAll("sourceItemId").map((value) => String(value));
  const quantities = data.getAll("quantity").map((value) => Number(value));
  const prices = data.getAll("unitPrice").map(euroToCents);
  if (!revisionId || sourceItemIds.length !== quantities.length || quantities.length !== prices.length) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-valida`);
  const { data: revision } = await supabase.from("quote_revisions").select("status").eq("id", revisionId).maybeSingle();
  if (revision?.status !== "draft") redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-modificabile`);
  const { data: requestItems } = await supabase.from("request_items").select("id,description,quantity").eq("request_id", requestId).order("created_at");
  const descriptionsBySource = new Map((requestItems ?? []).map((item) => [item.id, item.description]));
  const items = sourceItemIds.map((sourceRequestItemId, index) => ({ source_request_item_id: sourceRequestItemId, description: descriptionsBySource.get(sourceRequestItemId) ?? "", quantity: quantities[index], unit_price_cents: prices[index], total_cents: (prices[index] ?? 0) * quantities[index], sort_order: index }));
  if (!hasExactRequestedQuantities(requestItems ?? [], items.map((item) => ({ sourceRequestItemId: item.source_request_item_id, quantity: item.quantity }))) || items.some((item) => !item.description || item.unit_price_cents === null || item.unit_price_cents < 0)) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-valida`);
  const { error: removeError } = await supabase.from("quote_items").delete().eq("revision_id", revisionId);
  const { error: insertError } = await supabase.from("quote_items").insert(items.map((item) => ({ ...item, revision_id: revisionId, unit_price_cents: item.unit_price_cents! })));
  redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=${removeError || insertError ? "errore-bozza" : "bozza-salvata"}`);
}

export async function publishQuote(data: FormData) {
  const requestId = String(data.get("requestId") ?? ""); const revisionId = String(data.get("revisionId") ?? "");
  const discount = euroToCents(data.get("discount")); const deposit = euroToCents(data.get("deposit")); const conditions = String(data.get("conditions") ?? "").trim();
  const supabase = await requireOwner(requestId);
  if (!revisionId || discount === null || deposit === null) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=importi-non-validi`);
  const { error } = await supabase.rpc("publish_quote_revision", { p_revision_id: revisionId, p_discount_cents: discount, p_deposit_cents: deposit, p_conditions: conditions });
  redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=${error ? "pubblicazione-non-riuscita" : "preventivo-pubblicato"}`);
}
