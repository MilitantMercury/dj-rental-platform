import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCategory, createProduct, createService } from "./actions";
import { CatalogImageUpload } from "@/components/catalog-image-upload";
import { CatalogItemControls } from "@/components/catalog-item-controls";
import { ProductGalleryManager } from "@/components/product-gallery-manager";
import { catalogMediaUrl } from "@/lib/catalog-media";

export const dynamic = "force-dynamic";
const cents = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value / 100);

export default async function CatalogoAdmin({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  const [{ data: categories }, { data: products }, { data: services }, { data: productImages }, params] = await Promise.all([
    supabase.from("categories").select("id,name,slug,active,published_at,sort_order,parent_id,image_path,image_alt").order("sort_order").order("name"),
    supabase.from("products").select("id,name,slug,active,published_at,sort_order,reference_price_cents,category_id").order("sort_order").order("name"),
    supabase.from("services").select("id,name,slug,active,published_at,sort_order,reference_price_cents,category_id,image_path,image_alt").order("sort_order").order("name"),
    supabase.from("product_images").select("id,product_id,storage_path,alt_text,sort_order").order("sort_order").order("created_at"),
    searchParams,
  ]);
  const categoryName = new Map((categories ?? []).map((item) => [item.id, item.name]));
  const productImage = new Map<string, NonNullable<typeof productImages>[number]>();
  const productGalleries = new Map<string, NonNullable<typeof productImages>>();
  for (const image of productImages ?? []) { if (!productImage.has(image.product_id)) productImage.set(image.product_id, image); productGalleries.set(image.product_id, [...(productGalleries.get(image.product_id) ?? []), image]); }
  return <main className="catalog-page shell">
    <div className="catalog-header"><div><p className="eyebrow dark">Amministrazione</p><h1>Catalogo.</h1><p className="catalog-intro">Prepara i contenuti in bozza, ordinali e pubblicali quando sono pronti. La disattivazione preserva lo storico.</p></div><a className="catalog-back" href="/area-riservata">← Area riservata</a></div>
    {params.message ? <div className="auth-message catalog-message" role="status">{params.message}</div> : null}
    <section className="catalog-grid">
      <article className="catalog-panel"><h2>Nuova categoria</h2><form action={createCategory} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="es. audio" required /></label><label>Descrizione<textarea name="description" rows={3} /></label><button type="submit">Salva come bozza</button></form><ul className="catalog-list">{(categories ?? []).map((item, index, list) => <li key={item.id}><span>{item.image_path && <Image className="catalog-admin-thumb" src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt} width={240} height={160} />}<strong>{item.name}</strong><small>/{item.slug}</small><CatalogImageUpload kind="categories" entityId={item.id} label={item.name} /></span><CatalogItemControls table="categories" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} /></li>)}</ul></article>
      <article className="catalog-panel"><h2>Nuovo prodotto</h2><form action={createProduct} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>Categoria<select name="categoryId" defaultValue=""><option value="">Senza categoria</option>{(categories ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Prezzo indicativo (centesimi)<input name="referencePriceCents" type="number" min="0" step="1" placeholder="es. 15000" /></label><label>Descrizione<textarea name="description" rows={3} /></label><label>Accessori inclusi<textarea name="includedAccessories" rows={2} /></label><button type="submit">Salva come bozza</button></form><ul className="catalog-list">{(products ?? []).map((item, index, list) => <li key={item.id}><span>{productImage.get(item.id) && <Image className="catalog-admin-thumb" src={catalogMediaUrl(productImage.get(item.id)?.storage_path) ?? ""} alt={productImage.get(item.id)?.alt_text ?? ""} width={240} height={160} />}<strong>{item.name}</strong><small>{categoryName.get(item.category_id ?? "") ?? "Senza categoria"} · {cents(item.reference_price_cents)}</small><CatalogImageUpload kind="products" entityId={item.id} label={item.name} /><ProductGalleryManager productId={item.id} images={productGalleries.get(item.id) ?? []} /></span><CatalogItemControls table="products" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} /></li>)}</ul></article>
      <article className="catalog-panel"><h2>Nuovo servizio</h2><form action={createService} className="catalog-form"><label>Nome<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>Prezzo indicativo (centesimi)<input name="referencePriceCents" type="number" min="0" step="1" /></label><label>Descrizione<textarea name="description" rows={3} /></label><label>Condizioni<textarea name="conditions" rows={2} /></label><button type="submit">Salva come bozza</button></form><ul className="catalog-list">{(services ?? []).map((item, index, list) => <li key={item.id}><span>{item.image_path && <Image className="catalog-admin-thumb" src={catalogMediaUrl(item.image_path) ?? ""} alt={item.image_alt} width={240} height={160} />}<strong>{item.name}</strong><small>{cents(item.reference_price_cents)}</small><CatalogImageUpload kind="services" entityId={item.id} label={item.name} /></span><CatalogItemControls table="services" id={item.id} active={item.active} published={Boolean(item.published_at)} first={index === 0} last={index === list.length - 1} /></li>)}</ul></article>
    </section>
  </main>;
}