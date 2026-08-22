import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }, { data: services }, { data: productImages }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,image_path,image_alt").eq("active", true).not("published_at", "is", null).order("sort_order").order("created_at"),
    supabase.from("products").select("id,name,slug,description,category_id").eq("active", true).not("published_at", "is", null).order("sort_order").order("name"),
    supabase.from("services").select("id,name,slug,description,category_id,image_path,image_alt").eq("active", true).not("published_at", "is", null).order("sort_order").order("name"),
    supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").order("sort_order").order("created_at"),
  ]);
  const { categoria } = await searchParams;
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const selectedCategory = (categories ?? []).find((category) => category.slug === categoria);
  const filteredProducts = selectedCategory ? (products ?? []).filter((item) => item.category_id === selectedCategory.id) : products ?? [];
  const filteredServices = selectedCategory ? (services ?? []).filter((item) => item.category_id === selectedCategory.id) : services ?? [];
  const primaryProductImage = new Map<string, NonNullable<typeof productImages>[number]>();
  for (const image of productImages ?? []) if (!primaryProductImage.has(image.product_id)) primaryProductImage.set(image.product_id, image);
  const resultCount = filteredProducts.length + filteredServices.length;

  return <main className="catalog-public">
    <header className="catalog-public-hero"><div className="shell catalog-public-hero-inner"><div><p className="eyebrow">Catalogo professionale</p><h1>Il setup giusto.<br /><em>Senza compromessi.</em></h1></div><div className="catalog-public-hero-copy"><p>Scegli attrezzatura e servizi per raccontarci il tuo evento. Verificheremo insieme configurazione e disponibilità.</p><span>Nessun pagamento ora</span><span>Non è una prenotazione</span></div></div></header>
    <div className="shell catalog-public-content">
      <nav className="catalog-filter" aria-label="Filtra il catalogo per categoria"><div className="catalog-filter-heading"><div><p className="eyebrow dark">Esplora per categoria</p><span>Scorri per vedere tutte le categorie</span></div><strong>{resultCount} {resultCount === 1 ? "risultato" : "risultati"}</strong></div><div className="catalog-filter-list"><Link className={`catalog-filter-tile catalog-filter-all${!selectedCategory ? " is-active" : ""}`} href="/catalogo"><span className="catalog-filter-mark">∞</span><span className="catalog-filter-copy"><strong>Tutto il catalogo</strong><small>Attrezzatura e servizi</small></span></Link>{(categories ?? []).map((category) => <Link className={`catalog-filter-tile${selectedCategory?.id === category.id ? " is-active" : ""}`} key={category.id} href={`/catalogo?categoria=${category.slug}`}><span className="catalog-filter-media">{category.image_path ? <Image src={catalogMediaUrl(category.image_path) ?? ""} alt={category.image_alt || ""} fill sizes="260px" /> : <span>{category.name.slice(0, 2).toUpperCase()}</span>}</span><span className="catalog-filter-copy"><strong>{category.name}</strong><small>{category.description || "Scopri la selezione"}</small></span></Link>)}</div></nav>
      <CatalogSection eyebrow="01 / Attrezzatura" title="Costruisci il tuo setup" count={filteredProducts.length} empty="Nessuna attrezzatura disponibile in questa categoria.">{filteredProducts.map((item) => { const media = primaryProductImage.get(item.id); return <article className="catalog-product-card" key={item.id}><Link className="catalog-product-media" href={`/catalogo/prodotti/${item.slug}`} aria-label={`Scopri ${item.name}`}>{media ? <Image src={catalogMediaUrl(media.storage_path) ?? ""} alt={media.alt_text || item.name} fill sizes="(max-width: 720px) 100vw, 40vw" /> : <CatalogPlaceholder name={item.name} />}<span className="catalog-card-index">Attrezzatura</span></Link><div className="catalog-product-body"><small>{item.category_id ? categoryNames.get(item.category_id) : "Attrezzatura"}</small><h3>{item.name}</h3><p>{item.description || "Soluzione professionale configurabile per il tuo evento."}</p><div className="catalog-product-actions"><Link href={`/catalogo/prodotti/${item.slug}`}>Scopri i dettagli <span aria-hidden="true">↗</span></Link><AddToCart id={item.id} name={item.name} /></div></div></article>; })}</CatalogSection>
      <CatalogSection eyebrow="02 / Servizi" title="Completa l’esperienza" count={filteredServices.length} empty="Nessun servizio disponibile in questa categoria.">{filteredServices.map((item) => <article className="catalog-product-card catalog-service-card" key={item.id}><Link className="catalog-product-media" href={`/catalogo/servizi/${item.slug}`} aria-label={`Scopri ${item.name}`}>{item.image_path ? <Image src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt || item.name} fill sizes="(max-width: 720px) 100vw, 40vw" /> : <CatalogPlaceholder name={item.name} />}<span className="catalog-card-index">Servizio</span></Link><div className="catalog-product-body"><small>{item.category_id ? categoryNames.get(item.category_id) : "Servizio"}</small><h3>{item.name}</h3><p>{item.description || "Supporto professionale definito insieme al gestore."}</p><div className="catalog-product-actions"><Link href={`/catalogo/servizi/${item.slug}`}>Scopri i dettagli <span aria-hidden="true">↗</span></Link><AddToCart id={item.id} name={item.name} type="service" /></div></div></article>)}</CatalogSection>
    </div>
  </main>;
}

function CatalogSection({ eyebrow, title, count, empty, children }: { eyebrow: string; title: string; count: number; empty: string; children: React.ReactNode }) { return <section className="catalog-product-section"><header><div><p className="eyebrow dark">{eyebrow}</p><h2>{title}</h2></div><span>{count.toString().padStart(2, "0")}</span></header>{count > 0 ? <div className="catalog-product-grid">{children}</div> : <p className="catalog-empty-state">{empty}</p>}</section>; }
function CatalogPlaceholder({ name }: { name: string }) { return <span className="catalog-product-placeholder" aria-hidden="true"><i /><strong>{name.slice(0, 2).toUpperCase()}</strong><small>Immagine in arrivo</small></span>; }
