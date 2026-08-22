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
      ? (await supabase.from("products").select("id,name,slug,description,included_accessories,published_at,active").eq("id", id).maybeSingle()).data
      : (await supabase.from("services").select("id,name,slug,description,conditions,image_path,image_alt,published_at,active").eq("id", id).maybeSingle()).data;
  if (!item) notFound();
  const images = table === "products" ? (await supabase.from("product_images").select("id,storage_path,alt_text").eq("product_id", id).order("sort_order")).data ?? [] : [];
  const singleImage = "image_path" in item && item.image_path ? [{ id: item.id, storage_path: item.image_path, alt_text: item.image_alt }] : [];
  const media = table === "products" ? images : singleImage;

  return <main className="catalog-page shell"><Link className="catalog-back" href="/area-riservata/catalogo">← Torna all’editor</Link><div className="catalog-preview-banner" role="status">Anteprima owner · {item.published_at && item.active ? "pubblicato" : "non visibile al pubblico"}</div><article className="catalog-detail">
    {media.length ? <div className="catalog-gallery">{media.map(image => <div className="catalog-detail-media" key={image.id}><Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || item.name} fill sizes="(max-width: 720px) 100vw, 720px" /></div>)}</div> : null}
    <p className="eyebrow dark">Anteprima {table === "products" ? "prodotto" : table === "services" ? "servizio" : "categoria"}</p><h1>{item.name}</h1><p>{item.description || "Nessuna descrizione inserita."}</p>
    {"included_accessories" in item && typeof item.included_accessories === "string" && item.included_accessories && <><h2>Accessori inclusi</h2><p>{item.included_accessories}</p></>}
    {"conditions" in item && typeof item.conditions === "string" && item.conditions && <><h2>Condizioni</h2><p>{item.conditions}</p></>}
  </article></main>;
}