import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/add-to-cart";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("active", true).order("sort_order"),
    supabase.from("products").select("id,name,slug,description,category_id").eq("active", true).order("name"),
    supabase.from("services").select("id,name,slug,description,category_id").eq("active", true).order("name"),
  ]);
  const names = new Map((categories ?? []).map((category) => [category.id, category.name]));
  return <main className="catalog-page shell"><header className="catalog-header"><div><p className="eyebrow dark">Catalogo</p><h1>Scegliamo insieme<br /><em>il suono giusto.</em></h1><p className="catalog-intro">Seleziona attrezzatura e servizi per costruire la tua richiesta. Nessun pagamento, nessuna prenotazione automatica.</p></div><div className="catalog-header-actions"><Link className="catalog-cart" href="/carrello">Carrello <span>0</span></Link><Link className="catalog-back" href="/">Torna alla home</Link></div></header><section><div className="catalog-section-heading"><div><p className="eyebrow dark">01 / Attrezzatura</p><h2>Per il tuo setup</h2></div><span>{products?.length ?? 0} elementi</span></div><div className="catalog-grid">{(products ?? []).map((item) => <article className="catalog-panel" key={item.id}><div className="catalog-card-visual">{item.name.slice(0, 2).toUpperCase()}</div><small>{item.category_id ? names.get(item.category_id) : "Attrezzatura"}</small><h3>{item.name}</h3><p>{item.description || "Soluzione professionale configurabile per il tuo evento."}</p><div className="catalog-card-actions"><Link href={`/catalogo/prodotti/${item.slug}`}>Dettagli →</Link><AddToCart id={item.id} name={item.name} /></div></article>)}</div></section><section><div className="catalog-section-heading"><div><p className="eyebrow dark">02 / Servizi</p><h2>Il supporto che serve</h2></div><span>{services?.length ?? 0} elementi</span></div><div className="catalog-grid">{(services ?? []).map((item) => <article className="catalog-panel service-panel" key={item.id}><small>{item.category_id ? names.get(item.category_id) : "Servizio"}</small><h3>{item.name}</h3><p>{item.description || "Supporto professionale definito insieme al gestore."}</p><div className="catalog-card-actions"><Link href={`/catalogo/servizi/${item.slug}`}>Dettagli →</Link><AddToCart id={item.id} name={item.name} type="service" /></div></article>)}</div></section></main>;
}
