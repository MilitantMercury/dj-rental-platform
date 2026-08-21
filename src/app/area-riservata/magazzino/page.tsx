import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addUnavailability, saveAvailabilitySettings, saveStock } from "./actions";

export const dynamic = "force-dynamic";

export default async function WarehousePage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  const [{ data: products }, { data: stock }, { data: unavailability }, { data: settings }, params] = await Promise.all([
    supabase.from("products").select("id,name,active").order("name"),
    supabase.from("inventory_stock").select("product_id,total_quantity"),
    supabase.from("inventory_unavailability").select("id,product_id,quantity,start_date,end_date,reason,notes").order("created_at", { ascending: false }),
    supabase.from("app_settings").select("option_duration_hours,operational_margin_days").eq("id", true).maybeSingle(),
    searchParams,
  ]);
  const quantities = new Map((stock ?? []).map((item) => [item.product_id, item.total_quantity]));
  const nameFor = (productId: string) => products?.find((product) => product.id === productId)?.name ?? "Prodotto";
  return <main className="catalog-page shell"><div className="catalog-header"><div><p className="eyebrow dark">Magazzino</p><h1>Giacenze.</h1><p className="catalog-intro">Imposta le quantità fisicamente noleggiabili. Il cliente non vede mai questi dati.</p></div><Link className="catalog-back" href="/area-riservata">← Area riservata</Link></div>{params.message && <div className="auth-message catalog-message" role="status">{params.message.replaceAll("-", " ")}.</div>}<section className="warehouse-panel"><div className="warehouse-heading"><div><p className="detail-label">Regole globali</p><h2>Disponibilità nel tempo</h2></div></div><form className="catalog-form warehouse-unavailability-form" action={saveAvailabilitySettings}><label>Durata opzione (ore)<input name="optionHours" type="number" min="1" max="720" defaultValue={settings?.option_duration_hours ?? 48}/></label><label>Margine operativo (giorni)<input name="marginDays" type="number" min="0" max="30" defaultValue={settings?.operational_margin_days ?? 0}/></label><button type="submit">Salva regole</button></form></section><section className="warehouse-panel"><div className="warehouse-heading"><div><p className="detail-label">Disponibilità fisica</p><h2>Attrezzatura noleggiabile</h2></div><span>{products?.length ?? 0} prodotti</span></div><div className="warehouse-list">{(products ?? []).map((product) => <form action={saveStock} key={product.id} className="warehouse-row"><div><strong>{product.name}</strong><small>{product.active ? "Catalogo attivo" : "Non visibile nel catalogo"}</small></div><label>Quantità totale<input name="quantity" type="number" min="0" step="1" defaultValue={quantities.get(product.id) ?? 0} /></label><input type="hidden" name="productId" value={product.id} /><button type="submit">Salva</button></form>)}</div></section><section className="warehouse-panel warehouse-unavailability"><div className="warehouse-heading"><div><p className="detail-label">Fuori servizio</p><h2>Indisponibilità</h2></div></div><form className="catalog-form warehouse-unavailability-form" action={addUnavailability}><label>Prodotto<select name="productId" required defaultValue=""><option value="" disabled>Seleziona prodotto</option>{(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label>Quantità<input name="quantity" type="number" min="1" required/></label><label>Dal<input name="startDate" type="date"/></label><label>Al <small>lascia vuoto se indefinita</small><input name="endDate" type="date"/></label><label>Motivo<input name="reason" maxLength={160}/></label><label>Note<textarea name="notes" rows={2} maxLength={2000}/></label><button type="submit">Registra indisponibilità</button></form><ul className="external-supply-list">{(unavailability ?? []).map((entry) => <li key={entry.id}><strong>{nameFor(entry.product_id)} × {entry.quantity}</strong><span>{entry.start_date ?? "Subito"} → {entry.end_date ?? "Fino a nuova indicazione"}</span>{entry.reason && <small>{entry.reason}{entry.notes ? ` · ${entry.notes}` : ""}</small>}</li>)}</ul></section></main>;
}
