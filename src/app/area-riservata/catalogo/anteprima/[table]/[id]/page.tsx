import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CatalogPreview({ params }: { params: Promise<{ table: string; id: string }> }) {
  const { table, id } = await params;
  if (!["categories", "products", "services"].includes(table) || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");

  const item = table === "categories"
    ? (await supabase.from("categories").select("id,name,slug,description,image_path,image_alt,published_at,active").eq("id", id).maybeSingle()).data
    : table === "products"
      ? (await supabase.from("products").select("id,name,slug,description,included_accessories,reference_price_cents,category_id,published_at,active").eq("id", id).maybeSingle()).data
      : (await supabase.from("services").select("id,name,slug,description,conditions,reference_price_cents,category_id,image_path,image_alt,published_at,active").eq("id", id).maybeSingle()).data;
  if (!item) notFound();
  const productImage = table === "products" ? (await supabase.from("product_images").select("id,storage_path,alt_text").eq("product_id", id).order("sort_order").limit(1).maybeSingle()).data : null;
  const singleImage = "image_path" in item && item.image_path ? [{ id: item.id, storage_path: item.image_path, alt_text: item.image_alt }] : [];
  const media = table === "products" ? (productImage ? [productImage] : []) : singleImage;
  const categoryId = "category_id" in item ? item.category_id : null;
  const category = categoryId ? (await supabase.from("categories").select("name").eq("id", categoryId).maybeSingle()).data : null;
  const published = Boolean(item.published_at && item.active);
  const price = "reference_price_cents" in item ? item.reference_price_cents : null;
  const priceLabel = price === null ? "Prezzo da definire" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price / 100);
  const typeLabel = table === "products" ? "Prodotto" : table === "services" ? "Servizio" : "Categoria";

  return <main className="catalog-owner-preview shell">
    <header className="catalog-owner-preview-bar"><div><p className="eyebrow dark">Anteprima riservata</p><strong>Questa pagina è visibile solo all’owner.</strong></div><div><span className={`catalog-owner-preview-state ${published ? "is-live" : "is-draft"}`}>{published ? "Pubblicato" : "Non visibile al pubblico"}</span><Link className="catalog-back" href={`/area-riservata/catalogo?view=${table}`}>← Torna al catalogo</Link></div></header>
    <article className={`catalog-owner-preview-card is-${table}`}>
      <div className="catalog-owner-preview-media">{media.length ? <Image src={catalogMediaUrl(media[0]?.storage_path) ?? ""} alt={media[0]?.alt_text || item.name} fill priority sizes="(max-width: 800px) 100vw, 52vw" /> : <span>{item.name.slice(0, 2).toUpperCase()}</span>}</div>
      <div className="catalog-owner-preview-copy"><div className="catalog-owner-preview-meta"><span>{typeLabel}</span><span>{category?.name ?? (table === "categories" ? "Organizzazione catalogo" : "Senza categoria")}</span></div><h1>{item.name}</h1><p className="catalog-owner-preview-slug">/{item.slug}</p><p className="catalog-owner-preview-description">{item.description || "Nessuna descrizione inserita."}</p>{table !== "categories" && <div className="catalog-owner-preview-price"><small>Prezzo indicativo</small><strong>{priceLabel}</strong></div>}</div>
    </article>
    {"included_accessories" in item && typeof item.included_accessories === "string" && item.included_accessories && <section className="catalog-owner-preview-info"><p className="eyebrow dark">Dotazione</p><h2>Accessori inclusi</h2><p>{item.included_accessories}</p></section>}
    {"conditions" in item && typeof item.conditions === "string" && item.conditions && <section className="catalog-owner-preview-info"><p className="eyebrow dark">Dettagli del servizio</p><h2>Condizioni</h2><p>{item.conditions}</p></section>}
  </main>;
}
