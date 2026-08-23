import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CurrencyInput } from "@/components/currency-input";
import { QuoteEditorRows } from "@/components/quote-editor-rows";
import { AppMessage } from "@/components/app-message";
import { createClient } from "@/lib/supabase/server";
import { publishQuote, saveQuoteDraft } from "../../actions";

export const dynamic = "force-dynamic";

export default async function QuoteEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ message?: string }> }) {
  const { id } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect(`/area-riservata/pratiche/${id}`);
  const { data: quote } = await supabase.from("quotes").select("id").eq("request_id", id).maybeSingle();
  if (!quote) notFound();
  const { data: revision } = await supabase.from("quote_revisions").select("id,revision_number,status,discount_cents,deposit_cents,conditions").eq("quote_id", quote.id).order("revision_number", { ascending: false }).limit(1).maybeSingle();
  if (!revision) notFound();
  const [{ data: quoteItems }, { data: requestItems }] = await Promise.all([
    supabase.from("quote_items").select("id,source_request_item_id,description,quantity,unit_price_cents").eq("revision_id", revision.id).order("sort_order"),
    supabase.from("request_items").select("id,description,quantity").eq("request_id", id).order("created_at"),
  ]);
  const requestItemByDescription = new Map((requestItems ?? []).map((item) => [item.description, item]));
  const rows = quoteItems?.length
    ? quoteItems.map((item, index) => ({ id: item.id, sourceRequestItemId: item.source_request_item_id ?? requestItemByDescription.get(item.description)?.id ?? requestItems?.[index]?.id ?? "", description: item.description, quantity: item.quantity, unitPriceCents: item.unit_price_cents }))
    : (requestItems ?? []).map((item) => ({ id: item.id, sourceRequestItemId: item.id, description: item.description, quantity: item.quantity, unitPriceCents: 0 }));
  const editable = revision.status === "draft";
  return <main className="dashboard shell practice-detail-page"><Link href={`/area-riservata/pratiche/${id}`}>← Torna alla pratica</Link><div className="practice-detail-header"><div><p className="eyebrow dark">Preventivo · Revisione {revision.revision_number}</p><h1>Prepara la proposta.</h1><p className="practice-detail-subtitle">Indica il prezzo per ciascun pezzo. Se alcuni pezzi hanno un prezzo diverso, dividi la riga: la quantità complessiva rimane quella richiesta.</p></div><strong className="status-badge">{editable ? "Bozza" : "Pubblicata"}</strong></div>{message && <AppMessage message={message} />}<form className="catalog-form quote-editor" action={saveQuoteDraft}><input type="hidden" name="requestId" value={id}/><input type="hidden" name="revisionId" value={revision.id}/><section className="practice-items-section"><div className="practice-items-heading"><div><p className="detail-label">Voci economiche</p><h2>Materiali e servizi</h2></div></div><QuoteEditorRows initialRows={rows} editable={editable} /></section><section className="practice-status-panel"><p className="detail-label">Condizioni economiche</p><label>Sconto (€)<CurrencyInput name="discount" initialCents={revision.discount_cents} disabled={!editable}/></label><label>Cauzione (€)<CurrencyInput name="deposit" initialCents={revision.deposit_cents} disabled={!editable}/></label><label>Condizioni<textarea name="conditions" rows={5} defaultValue={revision.conditions} disabled={!editable}/></label>{editable && <div className="quote-editor-actions"><button type="submit">Salva bozza</button><button formAction={publishQuote} type="submit">Pubblica preventivo</button></div>}</section></form></main>;
}
