import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEventDate } from "@/lib/date-time";
import { createClient } from "@/lib/supabase/server";
import { transportContainerLabel } from "@/lib/transport-containers";
import { addTransportContainer, updatePreparationItem } from "./actions";
import { addOperationalAttachment } from "./attachments";

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
  const [{ data: items }, { data: containers }, { data: attachments }] = await Promise.all([
    supabase.from("preparation_items").select("id,description,expected_quantity,prepared_quantity,delivered_quantity,returned_quantity,status,notes").eq("preparation_list_id", list.id).order("created_at"),
    supabase.from("transport_containers").select("id,container_type,description,quantity,notes").eq("request_id", id).order("created_at"),
    supabase.from("request_attachments").select("id,category,file_name,mime_type,size_bytes,storage_path").eq("request_id", id).order("created_at", { ascending: false }),
  ]);
  const attachmentsWithUrls = await Promise.all((attachments ?? []).map(async (attachment) => ({ ...attachment, url: (await supabase.storage.from("operational-attachments").createSignedUrl(attachment.storage_path, 600)).data?.signedUrl ?? null })));
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
    <section className="operational-containers"><div><p className="detail-label">Trasporto</p><h2>Contenitori della pratica</h2><p>Registra i contenitori utilizzati per questa consegna o ritiro.</p></div><ul>{(containers ?? []).map((container) => <li key={container.id}><strong>{container.quantity} × {transportContainerLabel(container.container_type)}</strong><span>{container.description || "Senza descrizione"}</span>{container.notes && <small>{container.notes}</small>}</li>)}</ul>{!(containers ?? []).length && <p className="operational-empty">Nessun contenitore registrato.</p>}<form action={addTransportContainer} className="container-form"><input type="hidden" name="requestId" value={id}/><label>Tipo<select name="containerType" required defaultValue=""><option value="" disabled>Seleziona tipo</option><option value="flight_case">Flight case</option><option value="cassa">Cassa</option><option value="borsa">Borsa</option><option value="altro">Altro</option></select></label><label>Descrizione<input name="description" maxLength={240} placeholder="Es. flight case mixer" /></label><label>Quantità<input name="quantity" type="number" min="1" step="1" required /></label><label>Nota<textarea name="notes" rows={2} maxLength={2000}/></label><button type="submit">Aggiungi contenitore</button></form></section>
    <section className="operational-containers"><div><p className="detail-label">Documentazione</p><h2>Foto e allegati</h2><p>File privati di consegna e rientro: JPG, PNG, WebP o PDF, fino a 10 MB.</p></div><ul>{attachmentsWithUrls.map((attachment)=><li key={attachment.id}><strong>{attachment.category === "delivery" ? "Consegna" : attachment.category === "return" ? "Rientro" : "Generale"}</strong>{attachment.url ? <a href={attachment.url} target="_blank" rel="noreferrer">{attachment.file_name}</a> : <span>{attachment.file_name}</span>}</li>)}</ul>{!attachmentsWithUrls.length&&<p className="operational-empty">Nessun allegato registrato.</p>}<form action={addOperationalAttachment} className="container-form"><input type="hidden" name="requestId" value={id}/><label>Categoria<select name="category" defaultValue="delivery"><option value="delivery">Consegna</option><option value="return">Rientro</option><option value="general">Generale</option></select></label><label>File<input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required/></label><button type="submit">Carica allegato</button></form></section>
  </main>;
}
