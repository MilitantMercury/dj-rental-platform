import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEventDate } from "@/lib/date-time";
import { createClient } from "@/lib/supabase/server";
import { updatePreparationItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function OperationalChecklist({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ message?: string }> }) {
  const { id } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role,display_name").eq("user_id", user.id).maybeSingle();
  if (!staff) redirect("/area-riservata");
  const [{ data: request }, { data: list }] = await Promise.all([
    supabase.from("requests").select("request_code,event_type,event_date,event_end_date,venue_name,status").eq("id", id).maybeSingle(),
    supabase.from("preparation_lists").select("id,status,started_at").eq("request_id", id).maybeSingle(),
  ]);
  if (!request || !list) notFound();
  const { data: items } = await supabase.from("preparation_items").select("id,description,expected_quantity,prepared_quantity,delivered_quantity,returned_quantity,status,notes").eq("preparation_list_id", list.id).order("created_at");
  const listItems = items ?? [];
  const preparedCount = listItems.filter((item) => item.prepared_quantity === item.expected_quantity).length;

  return <main className="dashboard shell operational-page">
    <Link href={`/area-riservata/pratiche/${id}`}>← Torna alla pratica</Link>
    <header className="operational-header"><div><p className="eyebrow dark">Checklist operativa</p><h1>{request.event_type}</h1><p>{request.request_code} · {formatEventDate(request.event_date)} → {formatEventDate(request.event_end_date)} · {request.venue_name}</p></div><strong>{preparedCount}/{listItems.length} pronti</strong></header>
    {message && <div className="auth-message" role="status">{message === "checklist-aggiornata" ? "Checklist aggiornata." : message.replaceAll("-", " ")}</div>}
    <section className="operational-intro"><div><p className="detail-label">Preparazione</p><h2>Materiale della pratica</h2><p>Compila solo le quantità effettivamente preparate, consegnate e rientrate. Prezzi e movimenti economici non sono disponibili qui.</p></div><span>{staff.role === "owner" ? "Owner" : "Collaboratore"}</span></section>
    <div className="operational-list">
      {listItems.map((item) => <article key={item.id} className={`operational-item is-${item.status}`}><form action={updatePreparationItem}><input type="hidden" name="requestId" value={id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="expectedQuantity" value={item.expected_quantity}/><header><div><h2>{item.description}</h2><p>Previsti <strong>{item.expected_quantity}</strong></p></div><span>{item.status === "prepared" ? "Pronto" : item.status === "delivered" ? "Consegnato" : item.status === "returned" ? "Rientrato" : "Da preparare"}</span></header><div className="operational-quantities"><label>Preparati<input name="preparedQuantity" type="number" min="0" max={item.expected_quantity} defaultValue={item.prepared_quantity}/></label><label>Consegnati<input name="deliveredQuantity" type="number" min="0" max={item.expected_quantity} defaultValue={item.delivered_quantity}/></label><label>Rientrati<input name="returnedQuantity" type="number" min="0" max={item.expected_quantity} defaultValue={item.returned_quantity}/></label></div><label className="operational-notes">Note operative<textarea name="notes" rows={2} maxLength={2000} defaultValue={item.notes}/></label><button type="submit">Salva aggiornamento</button></form></article>)}
      {!listItems.length && <section className="practice-list-empty"><h2>Nessun materiale da preparare.</h2><p>Questa richiesta contiene solo servizi o non ha articoli materiali.</p></section>}
    </div>
  </main>;
}
