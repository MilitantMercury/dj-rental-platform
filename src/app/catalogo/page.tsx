import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("active", true).order("sort_order"),
    supabase.from("products").select("id,name,slug,description,category_id").eq("active", true).order("name"),
    supabase.from("services").select("id,name,slug,description,category_id").eq("active", true).order("name"),
  ]);
  const names = new Map((categories ?? []).map((category) => [category.id, category.name]));
  return <main className="catalog-page shell"><header className="catalog-header"><div><p className="eyebrow dark">Catalogo</p><h1>Attrezzatura e servizi per il tuo evento.</h1><p className="catalog-intro">Esplora le soluzioni disponibili e raccontaci di cosa hai bisogno.</p></div><Link className="catalog-back" href="/">Torna alla home</Link></header><section><h2>Attrezzatura</h2><div className="catalog-grid">{(products ?? []).map((item) => <article className="catalog-panel" key={item.id}><small>{item.category_id ? names.get(item.category_id) : "Attrezzatura"}</small><h3>{item.name}</h3><p>{item.description || "Soluzione professionale configurabile per il tuo evento."}</p><Link href={`/catalogo/prodotti/${item.slug}`}>Scopri di più →</Link></article>)}{!products?.length && <p>Il catalogo è in aggiornamento.</p>}</div></section><section><h2>Servizi</h2><div className="catalog-grid">{(services ?? []).map((item) => <article className="catalog-panel" key={item.id}><small>{item.category_id ? names.get(item.category_id) : "Servizio"}</small><h3>{item.name}</h3><p>{item.description || "Supporto professionale definito insieme al gestore."}</p><Link href={`/catalogo/servizi/${item.slug}`}>Scopri di più →</Link></article>)}</div></section></main>;
}
