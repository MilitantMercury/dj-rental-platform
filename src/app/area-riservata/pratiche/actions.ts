"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateQuoteTotals, euroToCents } from "@/lib/quote-pricing";
import { hasExactRequestedQuantities } from "@/lib/quote-lines";
import { defaultStatusTransitionNote, isAllowedOwnerStatusTransition } from "@/lib/request-lifecycle";
import { isFinancialRecordType } from "@/lib/financial-records";

export async function updateRequestStatus(data: FormData) {
  const id = String(data.get("requestId") ?? "");
  const current = String(data.get("currentStatus") ?? "");
  const next = String(data.get("status") ?? "");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staff?.role !== "owner" || !isAllowedOwnerStatusTransition(current, next)) {
    redirect(`/area-riservata/pratiche/${id}?message=transizione-non-consentita`);
  }

  const { data: updatedRequest, error } = await supabase
    .from("requests")
    .update({ status: next })
    .eq("id", id)
    .eq("status", current)
    .select("id")
    .maybeSingle();

  if (error || !updatedRequest) {
    redirect(`/area-riservata/pratiche/${id}?message=stato-aggiornato-da-altri`);
  }

  const customNote = String(data.get("note") ?? "").trim();
  await supabase.from("request_status_history").insert({
    request_id: id,
    previous_status: current,
    new_status: next,
    changed_by: user.id,
    note: customNote || defaultStatusTransitionNote(),
  });

  redirect(`/area-riservata/pratiche/${id}?message=stato-aggiornato`);
}

export async function confirmRequest(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const note = String(data.get("note") ?? "").trim();
  const supabase = await requireOwner(requestId);
  const { data: result, error } = await supabase.rpc("confirm_request_if_available", {
    p_request_id: requestId,
    p_note: note,
  });

  const confirmed = Boolean(result && typeof result === "object" && "confirmed" in result && result.confirmed);
  const reason = result && typeof result === "object" && "reason" in result ? result.reason : "";
  const conflicts = result && typeof result === "object" && "conflicts" in result ? result.conflicts : [];
  const conflictQuery = !confirmed && Array.isArray(conflicts) ? `&conflitti=${encodeURIComponent(JSON.stringify(conflicts))}` : "";
  redirect(`/area-riservata/pratiche/${requestId}?message=${error ? "errore-conferma" : confirmed ? "pratica-confermata" : reason === "caparra_non_registrata" ? "caparra-non-registrata" : "disponibilita-insufficiente"}${conflictQuery}`);
}

export async function markRequestAwaitingDeposit(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const note = String(data.get("note") ?? "").trim();
  const supabase = await requireOwner(requestId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: updated } = await supabase.from("requests").update({ status: "awaiting_deposit" }).eq("id", requestId).eq("status", "accepted").select("id").maybeSingle();
  if (!updated) redirect(`/area-riservata/pratiche/${requestId}?message=passaggio-caparra-non-riuscito`);
  await supabase.from("request_status_history").insert({ request_id: requestId, previous_status: "accepted", new_status: "awaiting_deposit", changed_by: user.id, note: note || "Preventivo accettato: in attesa della registrazione della caparra." });
  redirect(`/area-riservata/pratiche/${requestId}?message=in-attesa-caparra`);
}

export async function startPreparation(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const note = String(data.get("note") ?? "").trim();
  const supabase = await requireOwner(requestId);
  const { error } = await supabase.rpc("start_preparation_list", { p_request_id: requestId, p_note: note });
  redirect(error ? `/area-riservata/pratiche/${requestId}?message=preparazione-non-avviata` : `/area-riservata/pratiche/${requestId}/operativita?message=preparazione-avviata`);
}

export async function assignCollaborator(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const staffUserId = String(data.get("staffUserId") ?? "");
  const operationalRole = String(data.get("operationalRole") ?? "operator");
  if (!requestId || !staffUserId || !["operator", "lead"].includes(operationalRole)) redirect(`/area-riservata/pratiche/${requestId}?message=assegnazione-non-valida`);
  const supabase = await requireOwner(requestId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: collaborator } = await supabase.from("staff_profiles").select("user_id,role,active").eq("user_id", staffUserId).maybeSingle();
  if (!collaborator || collaborator.role !== "collaborator" || !collaborator.active) redirect(`/area-riservata/pratiche/${requestId}?message=collaboratore-non-valido`);
  const { error } = await supabase.from("request_assignments").upsert({ request_id: requestId, staff_user_id: staffUserId, operational_role: operationalRole, assigned_by: user.id }, { onConflict: "request_id,staff_user_id" });
  redirect(`/area-riservata/pratiche/${requestId}?message=${error ? "assegnazione-non-riuscita" : "collaboratore-assegnato"}`);
}

async function runOperationalTransition(data: FormData, rpc: "register_request_delivery" | "register_request_return" | "close_request", successMessage: string, failureMessage: string) {
  const requestId = String(data.get("requestId") ?? "");
  const note = String(data.get("note") ?? "").trim();
  const supabase = await requireOwner(requestId);
  const { data: result, error } = await supabase.rpc(rpc, { p_request_id: requestId, p_note: note });
  const updated = Boolean(result && typeof result === "object" && "updated" in result && result.updated);
  const reason = result && typeof result === "object" && "reason" in result ? result.reason : "";
  redirect(`/area-riservata/pratiche/${requestId}?message=${!error && updated ? successMessage : reason === "preparazione_incompleta" ? "preparazione-incompleta" : reason === "rientro_incompleto" ? "rientro-incompleto" : failureMessage}`);
}

export async function registerDelivery(data: FormData) {
  return runOperationalTransition(data, "register_request_delivery", "consegna-registrata", "consegna-non-registrata");
}

export async function registerReturn(data: FormData) {
  return runOperationalTransition(data, "register_request_return", "rientro-registrato", "rientro-non-registrato");
}

export async function closeRequest(data: FormData) {
  return runOperationalTransition(data, "close_request", "pratica-chiusa", "chiusura-non-riuscita");
}

export async function addExternalSupply(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const productId = String(data.get("productId") ?? "");
  const supplierName = String(data.get("supplierName") ?? "").trim();
  const quantity = Number(data.get("quantity"));
  const status = String(data.get("status") ?? "requested");
  const internalNotes = String(data.get("internalNotes") ?? "").trim();
  if (!requestId || !productId || !supplierName || !Number.isInteger(quantity) || quantity < 1 || !["requested", "confirmed"].includes(status)) redirect(`/area-riservata/pratiche/${requestId}?message=fornitura-non-valida`);
  const supabase = await requireOwner(requestId);
  const { error } = await supabase.from("external_supplies").insert({ request_id: requestId, product_id: productId, supplier_name: supplierName, quantity, status, internal_notes: internalNotes });
  redirect(`/area-riservata/pratiche/${requestId}?message=${error ? "fornitura-non-salvata" : "fornitura-salvata"}`);
}

export async function addFinancialRecord(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const recordType = String(data.get("recordType") ?? "");
  const amountCents = euroToCents(data.get("amount"));
  const recordedOn = String(data.get("recordedOn") ?? "");
  const paymentMethod = String(data.get("paymentMethod") ?? "").trim();
  const internalNotes = String(data.get("internalNotes") ?? "").trim();
  if (!requestId || !isFinancialRecordType(recordType) || amountCents === null || amountCents < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(recordedOn)) {
    redirect(`/area-riservata/pratiche/${requestId}?message=registrazione-economica-non-valida`);
  }
  const supabase = await requireOwner(requestId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { error } = await supabase.from("financial_records").insert({
    request_id: requestId,
    record_type: recordType,
    amount_cents: amountCents,
    recorded_on: recordedOn,
    payment_method: paymentMethod,
    internal_notes: internalNotes,
    recorded_by: user.id,
  });
  redirect(`/area-riservata/pratiche/${requestId}?message=${error ? "registrazione-economica-non-salvata" : "registrazione-economica-salvata"}`);
}

export async function placeOnOption(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const note = String(data.get("note") ?? "").trim();
  const supabase = await requireOwner(requestId);
  const { error } = await supabase.rpc("place_request_on_option", { p_request_id: requestId, p_note: note });
  redirect(`/area-riservata/pratiche/${requestId}?message=${error ? "opzione-non-creata" : "opzione-creata"}`);
}

export async function expireDueOptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  const { data, error } = await supabase.rpc("expire_due_options");
  redirect(`/area-riservata/pratiche?message=${error ? "opzioni-non-aggiornate" : `opzioni-aggiornate-${data ?? 0}`}`);
}

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
  const discount = euroToCents(data.get("discount"));
  const deposit = euroToCents(data.get("deposit"));
  const conditions = String(data.get("conditions") ?? "").trim();
  if (!revisionId || discount === null || deposit === null || sourceItemIds.length !== quantities.length || quantities.length !== prices.length) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-valida`);
  const { data: revision } = await supabase.from("quote_revisions").select("status").eq("id", revisionId).maybeSingle();
  if (revision?.status !== "draft") redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-modificabile`);
  const { data: requestItems } = await supabase.from("request_items").select("id,description,quantity").eq("request_id", requestId).order("created_at");
  const descriptionsBySource = new Map((requestItems ?? []).map((item) => [item.id, item.description]));
  const items = sourceItemIds.map((sourceRequestItemId, index) => ({ source_request_item_id: sourceRequestItemId, description: descriptionsBySource.get(sourceRequestItemId) ?? "", quantity: quantities[index], unit_price_cents: prices[index], total_cents: (prices[index] ?? 0) * quantities[index], sort_order: index }));
  if (!hasExactRequestedQuantities(requestItems ?? [], items.map((item) => ({ sourceRequestItemId: item.source_request_item_id, quantity: item.quantity }))) || items.some((item) => !item.description || item.unit_price_cents === null || item.unit_price_cents < 0)) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=bozza-non-valida`);
  const totals = calculateQuoteTotals(items.map((item) => item.total_cents), discount);
  if (!totals) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=sconto-non-valido`);
  const { error: removeError } = await supabase.from("quote_items").delete().eq("revision_id", revisionId);
  const { error: insertError } = await supabase.from("quote_items").insert(items.map((item) => ({ ...item, revision_id: revisionId, unit_price_cents: item.unit_price_cents! })));
  const { error: revisionError } = removeError || insertError
    ? { error: null }
    : await supabase
      .from("quote_revisions")
      .update({
        subtotal_cents: totals.subtotalCents,
        discount_cents: discount,
        total_cents: totals.totalCents,
        deposit_cents: deposit,
        conditions: conditions.slice(0, 5000),
      })
      .eq("id", revisionId)
      .eq("status", "draft");
  redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=${removeError || insertError || revisionError ? "errore-bozza" : "bozza-salvata"}`);
}

export async function publishQuote(data: FormData) {
  const requestId = String(data.get("requestId") ?? ""); const revisionId = String(data.get("revisionId") ?? "");
  const discount = euroToCents(data.get("discount")); const deposit = euroToCents(data.get("deposit")); const conditions = String(data.get("conditions") ?? "").trim();
  const supabase = await requireOwner(requestId);
  if (!revisionId || discount === null || deposit === null) redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=importi-non-validi`);
  const { error } = await supabase.rpc("publish_quote_revision", { p_revision_id: revisionId, p_discount_cents: discount, p_deposit_cents: deposit, p_conditions: conditions });
  redirect(`/area-riservata/pratiche/${requestId}/preventivo?message=${error ? "pubblicazione-non-riuscita" : "preventivo-pubblicato"}`);
}
