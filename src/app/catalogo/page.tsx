import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { AmbientMotionCanvas } from "@/components/ambient-motion-canvas";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { matchesCatalogSearch } from "@/lib/catalog-search";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }, { data: services }, { data: productImages }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,image_path,image_alt").eq("active", true).not("published_at", "is", null).order("sort_order").order("created_at"),
    supabase.from("products").select("id,name,slug,description,included_accessories,category_id").eq("active", true).not("published_at", "is", null).order("sort_order").order("name"),
    supabase.from("services").select("id,name,slug,description,conditions,category_id,image_path,image_alt").eq("active", true).not("published_at", "is", null).order("sort_order").order("name"),
    supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").order("sort_order").order("created_at"),
  ]);
  const { categoria, q } = await searchParams;
  const searchQuery = q?.trim().slice(0, 80) ?? "";
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const selectedCategory = (categories ?? []).find((category) => category.slug === categoria);
  const categoryProducts = selectedCategory ? (products ?? []).filter((item) => item.category_id === selectedCategory.id) : products ?? [];
  const categoryServices = selectedCategory ? (services ?? []).filter((item) => item.category_id === selectedCategory.id) : services ?? [];
  const filteredProducts = categoryProducts.filter(item => matchesCatalogSearch(item, searchQuery));
  const filteredServices = categoryServices.filter(item => matchesCatalogSearch(item, searchQuery));
  const primaryProductImage = new Map<string, NonNullable<typeof productImages>[number]>();
  for (const image of productImages ?? []) if (!primaryProductImage.has(image.product_id)) primaryProductImage.set(image.product_id, image);
  const resultCount = filteredProducts.length + filteredServices.length;
  const heroProduct = (products ?? []).find((item) => primaryProductImage.has(item.id));
  const heroProductMedia = heroProduct ? primaryProductImage.get(heroProduct.id) : undefined;
  const heroService = (services ?? []).find((item) => item.image_path);

  return <main className="catalog-public">
    <header className="catalog-public-hero">
      <AmbientMotionCanvas className="catalog-wow-canvas" />
      <div className="shell catalog-public-hero-inner">
        <div className="catalog-wow-intro"><p className="eyebrow">Catalogo professionale</p><h1>Costruisci<br />il tuo <em>suono.</em></h1><p>Scegli attrezzatura e servizi. Noi verifichiamo ogni dettaglio e prepariamo una proposta costruita sul tuo evento.</p><div className="catalog-wow-promises"><span>Selezione professionale</span><span>Proposta su misura</span></div></div>
        <div className="catalog-wow-stage" aria-label="In evidenza dal catalogo">
          <div className="catalog-wow-stage-glow" />
          <div className="catalog-wow-feature catalog-wow-feature-main">{heroProductMedia && heroProduct ? <><Image src={catalogMediaUrl(heroProductMedia.storage_path) ?? ""} alt={heroProductMedia.alt_text || heroProduct.name} fill priority sizes="42vw" /><span><small>Attrezzatura</small><strong>{heroProduct.name}</strong></span></> : <CatalogPlaceholder name="DJ" />}</div>
          {heroService?.image_path && <div className="catalog-wow-feature catalog-wow-feature-side"><Image src={catalogMediaUrl(heroService.image_path) ?? ""} alt={heroService.image_alt || heroService.name} fill sizes="18vw" /><span><small>Servizio</small><strong>{heroService.name}</strong></span></div>}
          <div className="catalog-wow-stamp"><strong>{resultCount}</strong><span>soluzioni<br />da esplorare</span></div>
        </div>
      </div>
    </header>
    <div className="shell catalog-public-content">
      <search className="catalog-search" aria-label="Cerca nel catalogo"><form action="/catalogo"><div><label htmlFor="catalog-search-input">Cosa stai cercando?</label><input id="catalog-search-input" type="search" name="q" defaultValue={searchQuery} placeholder="Es. console, cuffie, vocalist…" maxLength={80} /></div>{selectedCategory && <input type="hidden" name="categoria" value={selectedCategory.slug} />}<button type="submit"><span aria-hidden="true">⌕</span> Cerca</button>{searchQuery && <Link href={selectedCategory ? `/catalogo?categoria=${selectedCategory.slug}` : "/catalogo"}>Azzera ricerca</Link>}</form></search>
      <nav className="catalog-filter" aria-label="Filtra il catalogo per categoria">
        <div className="catalog-filter-heading"><div><p className="eyebrow dark">Esplora per categoria</p><span>Scorri per vedere tutte le categorie</span></div><strong>{resultCount} {resultCount === 1 ? "risultato" : "risultati"}</strong></div>
        <div className="catalog-filter-list">
          <Link aria-current={!selectedCategory ? "page" : undefined} className={`catalog-filter-tile catalog-filter-all${!selectedCategory ? " is-active" : ""}`} href={searchQuery ? `/catalogo?q=${encodeURIComponent(searchQuery)}` : "/catalogo"}><span className="catalog-filter-mark">∞</span><span className="catalog-filter-copy"><strong>Tutto il catalogo</strong><small>Attrezzatura e servizi</small></span></Link>
          {(categories ?? []).map((category) => { const active = selectedCategory?.id === category.id; const href = `/catalogo?categoria=${encodeURIComponent(category.slug)}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`; return <Link aria-current={active ? "page" : undefined} className={`catalog-filter-tile${active ? " is-active" : ""}`} key={category.id} href={href}><span className="catalog-filter-media">{category.image_path ? <Image src={catalogMediaUrl(category.image_path) ?? ""} alt={category.image_alt || ""} fill sizes="260px" /> : <span>{category.name.slice(0, 2).toUpperCase()}</span>}</span><span className="catalog-filter-copy"><strong>{category.name}</strong><small>{category.description || "Scopri la selezione"}</small></span></Link>; })}
        </div>
      </nav>
      {selectedCategory && <aside className="catalog-active-filter" aria-label="Filtro attivo"><div><span>Filtro attivo</span><strong>{selectedCategory.name}</strong><small>{resultCount} {resultCount === 1 ? "contenuto trovato" : "contenuti trovati"}</small></div><Link href={searchQuery ? `/catalogo?q=${encodeURIComponent(searchQuery)}` : "/catalogo"}>Rimuovi filtro <span aria-hidden="true">×</span></Link></aside>}
      {searchQuery && <aside className="catalog-active-search" aria-label="Ricerca attiva"><span>Risultati per</span><strong>“{searchQuery}”</strong><small>{resultCount} {resultCount === 1 ? "risultato" : "risultati"}</small></aside>}
      <CatalogSection eyebrow="01 / Attrezzatura" title="Costruisci il tuo setup" count={filteredProducts.length} itemLabel="prodotti" empty="Nessuna attrezzatura disponibile in questa categoria.">{filteredProducts.map((item) => { const media = primaryProductImage.get(item.id); return <article className="catalog-product-card" key={item.id}><Link className="catalog-product-media" href={`/catalogo/prodotti/${item.slug}`} aria-label={`Scopri ${item.name}`}>{media ? <Image src={catalogMediaUrl(media.storage_path) ?? ""} alt={media.alt_text || item.name} fill sizes="(max-width: 720px) 100vw, 40vw" /> : <CatalogPlaceholder name={item.name} />}<span className="catalog-card-index">Attrezzatura</span></Link><div className="catalog-product-body"><small>{item.category_id ? categoryNames.get(item.category_id) : "Attrezzatura"}</small><h3>{item.name}</h3><p>{item.description || "Soluzione professionale configurabile per il tuo evento."}</p><div className="catalog-product-actions"><Link href={`/catalogo/prodotti/${item.slug}`}>Scopri i dettagli <span aria-hidden="true">↗</span></Link><AddToCart id={item.id} name={item.name} /></div></div></article>; })}</CatalogSection>
      <CatalogSection eyebrow="02 / Servizi" title="Completa l’esperienza" count={filteredServices.length} itemLabel="servizi" empty="Nessun servizio disponibile in questa categoria.">{filteredServices.map((item) => <article className="catalog-product-card catalog-service-card" key={item.id}><Link className="catalog-product-media" href={`/catalogo/servizi/${item.slug}`} aria-label={`Scopri ${item.name}`}>{item.image_path ? <Image src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt || item.name} fill sizes="(max-width: 720px) 100vw, 40vw" /> : <CatalogPlaceholder name={item.name} />}<span className="catalog-card-index">Servizio</span></Link><div className="catalog-product-body"><small>{item.category_id ? categoryNames.get(item.category_id) : "Servizio"}</small><h3>{item.name}</h3><p>{item.description || "Supporto professionale definito insieme al gestore."}</p><div className="catalog-product-actions"><Link href={`/catalogo/servizi/${item.slug}`}>Scopri i dettagli <span aria-hidden="true">↗</span></Link><AddToCart id={item.id} name={item.name} type="service" /></div></div></article>)}</CatalogSection>
    </div>
  </main>;
}

function CatalogSection({ eyebrow, title, count, itemLabel, empty, children }: { eyebrow: string; title: string; count: number; itemLabel: "prodotti" | "servizi"; empty: string; children: React.ReactNode }) { const label = count === 1 ? (itemLabel === "prodotti" ? "prodotto" : "servizio") : itemLabel; return <section className="catalog-product-section"><header><div><p className="eyebrow dark">{eyebrow}</p><h2>{title}</h2></div><span className="catalog-section-count"><strong>{count}</strong> {label}</span></header>{count > 0 ? <div className="catalog-product-grid">{children}</div> : <p className="catalog-empty-state">{empty}</p>}</section>; }
function CatalogPlaceholder({ name }: { name: string }) { return <span className="catalog-product-placeholder" aria-hidden="true"><i /><strong>{name.slice(0, 2).toUpperCase()}</strong><small>Immagine in arrivo</small></span>; }
