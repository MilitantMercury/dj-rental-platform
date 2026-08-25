import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCategory, createProduct, createService } from "./actions";
import { CatalogImageUpload } from "@/components/catalog-image-upload";
import { CatalogItemControls } from "@/components/catalog-item-controls";
import { CatalogItemEditor } from "@/components/catalog-item-editor";
import { CatalogSlugFields } from "@/components/catalog-slug-fields";
import { CurrencyInput } from "@/components/currency-input";
import { AppMessage } from "@/components/app-message";
import { ProductGalleryManager } from "@/components/product-gallery-manager";
import { catalogMediaUrl } from "@/lib/catalog-media";

export const dynamic = "force-dynamic";
type CatalogView = "categories" | "products" | "services";
const views: CatalogView[] = ["categories", "products", "services"];
const cents = (value: number | null) => value === null ? "Prezzo non indicato" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value / 100);
const pricePerPiece = (value: number | null) => value === null ? "Prezzo non indicato" : `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(value / 100)} € / pezzo`;

export default async function CatalogoAdmin({ searchParams }: { searchParams: Promise<{ message?: string; view?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  const [{ data: categories }, { data: products }, { data: services }, { data: productImages }, params] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,active,published_at,sort_order,parent_id,image_path,image_alt").order("sort_order").order("name"),
    supabase.from("products").select("id,name,slug,description,included_accessories,active,published_at,sort_order,reference_price_cents,category_id,featured_on_home").order("sort_order").order("name"),
    supabase.from("services").select("id,name,slug,description,conditions,active,published_at,sort_order,reference_price_cents,category_id,image_path,image_alt,featured_on_home").order("sort_order").order("name"),
    supabase.from("product_images").select("id,product_id,storage_path,alt_text,sort_order").order("sort_order").order("created_at"),
    searchParams,
  ]);
  const activeView: CatalogView = views.includes(params.view as CatalogView) ? params.view as CatalogView : "products";
  const categoryName = new Map((categories ?? []).map(item => [item.id, item.name]));
  const productImage = new Map<string, NonNullable<typeof productImages>[number]>();
  const productGallery = new Map<string, NonNullable<typeof productImages>>();
  for (const image of productImages ?? []) {
    if (!productImage.has(image.product_id)) productImage.set(image.product_id, image);
    productGallery.set(image.product_id, [...(productGallery.get(image.product_id) ?? []), image]);
  }
  const counts = { categories: categories?.length ?? 0, products: products?.length ?? 0, services: services?.length ?? 0 };
  const publishedCount = [...(categories ?? []), ...(products ?? []), ...(services ?? [])].filter(item => item.published_at).length;

  return <main className="catalog-page catalog-admin-page shell">
    <header className="catalog-admin-hero"><div><p className="eyebrow dark">Amministrazione / Catalogo</p><h1>Contenuti<br /><em>in ordine.</em></h1><p>Gestisci schede, immagini e pubblicazione da un’unica vista pulita. Ogni modifica resta separata dallo storico delle pratiche.</p></div><div className="catalog-admin-hero-actions"><Link className="catalog-back" href="/area-riservata">← Area riservata</Link><Link className="catalog-admin-public-link" href="/catalogo">Vedi catalogo pubblico ↗</Link></div></header>
    {params.message ? <AppMessage message={params.message} /> : null}
    <section className="catalog-admin-stats" aria-label="Riepilogo catalogo"><div><span>Totale contenuti</span><strong>{counts.categories + counts.products + counts.services}</strong></div><div><span>Pubblicati</span><strong>{publishedCount}</strong></div><div><span>In bozza</span><strong>{counts.categories + counts.products + counts.services - publishedCount}</strong></div></section>
    <nav className="catalog-admin-tabs" aria-label="Sezioni catalogo"><Link className={activeView === "products" ? "is-active" : ""} href="/area-riservata/catalogo?view=products"><span>01</span> Prodotti <strong>{counts.products}</strong></Link><Link className={activeView === "categories" ? "is-active" : ""} href="/area-riservata/catalogo?view=categories"><span>02</span> Categorie <strong>{counts.categories}</strong></Link><Link className={activeView === "services" ? "is-active" : ""} href="/area-riservata/catalogo?view=services"><span>03</span> Servizi <strong>{counts.services}</strong></Link></nav>
    <section className="catalog-admin-workspace">
      <div className="catalog-admin-section-heading"><div><p className="eyebrow dark">{activeView === "products" ? "Attrezzatura" : activeView === "categories" ? "Organizzazione" : "Supporto professionale"}</p><h2>{activeView === "products" ? "Prodotti" : activeView === "categories" ? "Categorie" : "Servizi"}</h2></div><span>{counts[activeView]} {counts[activeView] === 1 ? "elemento" : "elementi"}</span></div>
      <details className="catalog-create-drawer"><summary><span aria-hidden="true">＋</span> Nuov{activeView === "categories" ? "a categoria" : activeView === "products" ? "o prodotto" : "o servizio"}</summary><div className="catalog-create-drawer-body">
        {activeView === "categories" && <form action={createCategory} className="catalog-form catalog-create-form"><CatalogSlugFields /><label className="is-wide">Descrizione<textarea name="description" rows={3} /></label><button type="submit">Salva come bozza</button></form>}
        {activeView === "products" && <form action={createProduct} className="catalog-form catalog-create-form"><CatalogSlugFields /><label>Categoria<select name="categoryId" defaultValue=""><option value="">Senza categoria</option>{(categories ?? []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Prezzo indicativo (€)<CurrencyInput name="referencePrice" initialCents={null} placeholder="es. 150,00" /></label><label className="is-wide">Descrizione<textarea name="description" rows={3} /></label><label className="is-wide">Accessori inclusi<textarea name="includedAccessories" rows={2} /></label><button type="submit">Salva come bozza</button></form>}
        {activeView === "services" && <form action={createService} className="catalog-form catalog-create-form"><CatalogSlugFields /><label>Categoria<select name="categoryId" defaultValue=""><option value="">Senza categoria</option>{(categories ?? []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Prezzo indicativo (€)<CurrencyInput name="referencePrice" initialCents={null} placeholder="es. 150,00" /></label><label className="is-wide">Descrizione<textarea name="description" rows={3} /></label><label className="is-wide">Condizioni<textarea name="conditions" rows={2} /></label><button type="submit">Salva come bozza</button></form>}
      </div></details>
      <div className="catalog-admin-list">
        {activeView === "categories" && (categories ?? []).map((item, index, list) => <article className="catalog-admin-item" key={item.id}><div className="catalog-admin-item-media">{item.image_path ? <Image src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt} fill sizes="180px" /> : <span>{item.name.slice(0, 2).toUpperCase()}</span>}</div><div className="catalog-admin-item-content"><div className="catalog-admin-item-title"><div><small>/{item.slug}</small><h3>{item.name}</h3><p>{item.description || "Nessuna descrizione inserita."}</p></div><CatalogItemControls table="categories" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} /></div><CatalogItemEditor table="categories" item={item} categories={categories ?? []} /><details className="catalog-admin-media-tools"><summary><span>02</span> Immagine categoria</summary><CatalogImageUpload kind="categories" entityId={item.id} label={item.name} hasImage={Boolean(item.image_path)} /></details></div></article>)}
        {activeView === "products" && (products ?? []).map((item, index, list) => { const media = productImage.get(item.id); const gallery = productGallery.get(item.id) ?? []; return <article className="catalog-admin-item" key={item.id}><div className="catalog-admin-item-media is-product">{media ? <Image src={catalogMediaUrl(media.storage_path) ?? ""} alt={media.alt_text || item.name} fill sizes="180px" /> : <span>{item.name.slice(0, 2).toUpperCase()}</span>}</div><div className="catalog-admin-item-content"><div className="catalog-admin-item-title"><div><small>{categoryName.get(item.category_id ?? "") ?? "Senza categoria"}</small><h3>{item.name}</h3><p>{pricePerPiece(item.reference_price_cents)}</p></div><CatalogItemControls table="products" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} featured={item.featured_on_home} hasMedia={Boolean(media)} /></div><CatalogItemEditor table="products" item={item} categories={categories ?? []} /><details className="catalog-admin-media-tools"><summary><span>02</span> Galleria prodotto <b>{gallery.length}</b></summary><CatalogImageUpload kind="products" entityId={item.id} label={item.name} hasImage={Boolean(media)} /><ProductGalleryManager productId={item.id} images={gallery.map(image => ({ ...image, alt_text: image.alt_text ?? item.name }))} /></details></div></article>; })}
        {activeView === "services" && (services ?? []).map((item, index, list) => <article className="catalog-admin-item" key={item.id}><div className="catalog-admin-item-media">{item.image_path ? <Image src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt || item.name} fill sizes="180px" /> : <span>{item.name.slice(0, 2).toUpperCase()}</span>}</div><div className="catalog-admin-item-content"><div className="catalog-admin-item-title"><div><small>{categoryName.get(item.category_id ?? "") ?? "Servizio"}</small><h3>{item.name}</h3><p>{cents(item.reference_price_cents)} · /{item.slug}</p></div><CatalogItemControls table="services" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} featured={item.featured_on_home} hasMedia={Boolean(item.image_path)} /></div><CatalogItemEditor table="services" item={item} categories={categories ?? []} /><details className="catalog-admin-media-tools"><summary><span>02</span> Immagine servizio</summary><CatalogImageUpload kind="services" entityId={item.id} label={item.name} hasImage={Boolean(item.image_path)} /></details></div></article>)}
        {counts[activeView] === 0 && <div className="catalog-admin-empty"><strong>Qui è ancora vuoto.</strong><p>Usa il pulsante “Nuovo” per creare il primo contenuto.</p></div>}
      </div>
    </section>
  </main>;
}
