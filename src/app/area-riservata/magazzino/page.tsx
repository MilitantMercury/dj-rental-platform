import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { createClient } from "@/lib/supabase/server";
import { addUnavailability, saveStock } from "./actions";

export const dynamic = "force-dynamic";

export default async function WarehousePage({ searchParams }: { searchParams: Promise<{ message?: string; q?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");

  const [{ data: products }, { data: stock }, { data: unavailability }, { data: productImages }, params] = await Promise.all([
    supabase.from("products").select("id,name,active").order("name"),
    supabase.from("inventory_stock").select("product_id,total_quantity"),
    supabase.from("inventory_unavailability").select("id,product_id,quantity,start_date,end_date,reason,notes").order("created_at", { ascending: false }),
    supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").order("sort_order").order("created_at"),
    searchParams,
  ]);

  const query = params.q?.trim().slice(0, 80) ?? "";
  const normalizedQuery = query.toLocaleLowerCase("it");
  const filteredProducts = (products ?? []).filter(product => !normalizedQuery || product.name.toLocaleLowerCase("it").includes(normalizedQuery) || product.id.toLowerCase().startsWith(normalizedQuery));
  const quantities = new Map((stock ?? []).map(item => [item.product_id, item.total_quantity]));
  const primaryImages = new Map<string, NonNullable<typeof productImages>[number]>();
  for (const image of productImages ?? []) if (!primaryImages.has(image.product_id)) primaryImages.set(image.product_id, image);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const unavailableToday = new Map<string, number>();
  for (const entry of unavailability ?? []) {
    if ((!entry.start_date || entry.start_date <= today) && (!entry.end_date || entry.end_date >= today)) unavailableToday.set(entry.product_id, (unavailableToday.get(entry.product_id) ?? 0) + entry.quantity);
  }
  const nameFor = (productId: string) => products?.find(product => product.id === productId)?.name ?? "Prodotto";

  return <main className="catalog-page shell warehouse-page">
    <header className="warehouse-hero">
      <div className="warehouse-hero-copy"><p className="eyebrow">Magazzino operativo</p><h1>Giacenze<span>.</span></h1><p>Controlla e aggiorna le quantità fisicamente noleggiabili. Questi dati restano sempre riservati all’owner.</p></div>
      <nav className="warehouse-hero-actions" aria-label="Azioni magazzino"><Link className="catalog-back" href="/area-riservata">← Area riservata</Link><Link className="dashboard-link" href="/area-riservata/impostazioni">Regole disponibilità →</Link></nav>
      <div className="warehouse-hero-stats" aria-label="Riepilogo magazzino"><span><strong>{products?.length ?? 0}</strong> articoli gestiti</span><span><strong>{(products ?? []).filter(product => product.active).length}</strong> nel catalogo</span><span><strong>{(unavailability ?? []).length}</strong> fuori servizio</span></div>
    </header>
    {params.message && <div className="auth-message catalog-message" role="status">{params.message.replaceAll("-", " ")}.</div>}

    <section className="warehouse-panel warehouse-stock-grid">
      <div className="warehouse-heading"><div><p className="detail-label">Disponibilità fisica</p><h2>Contenuto di magazzino</h2></div><span>{filteredProducts.length} di {products?.length ?? 0} prodotti</span></div>
      <form className="warehouse-search" action="/area-riservata/magazzino"><label htmlFor="warehouse-search">Cerca articolo</label><div><input id="warehouse-search" type="search" name="q" defaultValue={query} placeholder="Nome prodotto o codice…" maxLength={80} /><button type="submit">Cerca</button>{query && <Link href="/area-riservata/magazzino">Azzera</Link>}</div></form>
      <div className="warehouse-table-scroll"><table className="warehouse-table"><thead><tr><th>Codice</th><th>Prodotto</th><th>Catalogo</th><th>Quantità totale</th><th>Fuori servizio</th><th>Disponibile oggi</th><th>Stato</th><th><span className="sr-only">Azioni</span></th></tr></thead><tbody>{filteredProducts.map(product => {
        const quantity = quantities.get(product.id) ?? 0;
        const unavailable = unavailableToday.get(product.id) ?? 0;
        const available = Math.max(quantity - unavailable, 0);
        const image = primaryImages.get(product.id);
        const formId = `stock-${product.id}`;
        return <tr key={product.id}><td><code>{product.id.slice(0, 8).toUpperCase()}</code></td><td><div className="warehouse-product">{image ? <span><Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || ""} fill sizes="52px" /></span> : <span className="is-placeholder">{product.name.slice(0, 2).toUpperCase()}</span>}<strong>{product.name}</strong></div></td><td><span className={`warehouse-status${product.active ? " is-active" : " is-muted"}`}>{product.active ? "Attivo" : "Nascosto"}</span></td><td><form id={formId} action={saveStock}><input type="hidden" name="productId" value={product.id} /><label><span className="sr-only">Quantità totale di {product.name}</span><input name="quantity" type="number" min="0" step="1" defaultValue={quantity} /></label></form></td><td><strong className={unavailable > 0 ? "warehouse-number is-warning" : "warehouse-number"}>{unavailable}</strong></td><td><strong className={available > 0 ? "warehouse-number is-available" : "warehouse-number is-empty"}>{available}</strong></td><td><span className={`warehouse-status${available > 0 ? " is-active" : " is-warning"}`}>{available > 0 ? "Operativo" : "Non disponibile"}</span></td><td><button className="warehouse-save" form={formId} type="submit">Salva</button></td></tr>;
      })}</tbody></table>{!filteredProducts.length && <p className="warehouse-empty">Nessun prodotto corrisponde alla ricerca.</p>}</div>
    </section>

    <section className="warehouse-panel warehouse-unavailability"><div className="warehouse-heading"><div><p className="detail-label">Fuori servizio</p><h2>Indisponibilità</h2></div><span>{unavailability?.length ?? 0} registrazioni</span></div><form className="catalog-form warehouse-unavailability-form" action={addUnavailability}><label>Prodotto<select name="productId" required defaultValue=""><option value="" disabled>Seleziona prodotto</option>{(products ?? []).map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label>Quantità<input name="quantity" type="number" min="1" required /></label><label>Dal<input name="startDate" type="date" /></label><label>Al <small>lascia vuoto se indefinita</small><input name="endDate" type="date" /></label><label>Motivo<input name="reason" maxLength={160} /></label><label>Note<textarea name="notes" rows={2} maxLength={2000} /></label><button type="submit">Registra indisponibilità</button></form><ul className="external-supply-list">{(unavailability ?? []).map(entry => <li key={entry.id}><strong>{nameFor(entry.product_id)} × {entry.quantity}</strong><span>{entry.start_date ?? "Subito"} → {entry.end_date ?? "Fino a nuova indicazione"}</span>{entry.reason && <small>{entry.reason}{entry.notes ? ` · ${entry.notes}` : ""}</small>}</li>)}</ul></section>
  </main>;
}
