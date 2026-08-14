import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCategory, createProduct, createService, toggleCatalogItem } from "./actions";

export const dynamic = "force-dynamic";

const cents = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value / 100);

export default async function CatalogoAdmin({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  const [{ data: categories }, { data: products }, { data: services }, params] = await Promise.all([
    supabase.from("categories").select("id,name,slug,active,sort_order,parent_id").order("sort_order").order("name"),
    supabase.from("products").select("id,name,slug,active,reference_price_cents,category_id").order("name"),
    supabase.from("services").select("id,name,slug,active,reference_price_cents,category_id").order("name"),
    searchParams,
  ]);
  const categoryName = new Map((categories ?? []).map((item) => [item.id, item.name]));
  return <main className="catalog-page shell">
    <div className="catalog-header"><div><p className="eyebrow dark">Amministrazione</p><h1>Catalogo.</h1><p className="catalog-intro">Gestisci ciò che può essere proposto ai clienti. La disattivazione preserva lo storico.</p></div><a className="catalog-back" href="/area-riservata">← Area riservata</a></div>
    {params.message ? <div className="auth-message catalog-message" role="status">{params.message}</div> : null}
    <section className="catalog-grid">
      <article className="catalog-panel"><h2>Nuova categoria</h2><form action={createCategory} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="es. audio" required /></label><label>Descrizione<textarea name="description" rows={3} /></label><button type="submit">Aggiungi categoria</button></form><ul className="catalog-list">{(categories ?? []).map((item) => <li key={item.id}><span><strong>{item.name}</strong><small>/{item.slug}</small></span><form action={toggleCatalogItem}><input type="hidden" name="table" value="categories" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="active" value={String(item.active)} /><button className="status-button" type="submit">{item.active ? "Attiva" : "Disattiva"}</button></form></li>)}</ul></article>
      <article className="catalog-panel"><h2>Nuovo prodotto</h2><form action={createProduct} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>Categoria<select name="categoryId" defaultValue=""><option value="">Senza categoria</option>{(categories ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Prezzo indicativo (centesimi)<input name="referencePriceCents" type="number" min="0" step="1" placeholder="es. 15000" /></label><label>Descrizione<textarea name="description" rows={3} /></label><label>Accessori inclusi<textarea name="includedAccessories" rows={2} /></label><button type="submit">Aggiungi prodotto</button></form><ul className="catalog-list">{(products ?? []).map((item) => <li key={item.id}><span><strong>{item.name}</strong><small>{categoryName.get(item.category_id ?? "") ?? "Senza categoria"} · {cents(item.reference_price_cents)}</small></span><form action={toggleCatalogItem}><input type="hidden" name="table" value="products" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="active" value={String(item.active)} /><button className="status-button" type="submit">{item.active ? "Attivo" : "Disattivo"}</button></form></li>)}</ul></article>
      <article className="catalog-panel"><h2>Nuovo servizio</h2><form action={createService} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>Prezzo indicativo (centesimi)<input name="referencePriceCents" type="number" min="0" step="1" /></label><label>Descrizione<textarea name="description" rows={3} /></label><label>Condizioni<textarea name="conditions" rows={2} /></label><button type="submit">Aggiungi servizio</button></form><ul className="catalog-list">{(services ?? []).map((item) => <li key={item.id}><span><strong>{item.name}</strong><small>{cents(item.reference_price_cents)}</small></span><form action={toggleCatalogItem}><input type="hidden" name="table" value="services" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="active" value={String(item.active)} /><button className="status-button" type="submit">{item.active ? "Attivo" : "Disattivo"}</button></form></li>)}</ul></article>
    </section>
  </main>;
}
