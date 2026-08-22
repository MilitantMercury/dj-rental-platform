import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select("id,name,description,included_accessories").eq("slug", slug).eq("active", true).not("published_at", "is", null).maybeSingle();
  if (!data) notFound();
  const { data: images } = await supabase.from("product_images").select("id,storage_path,alt_text").eq("product_id", data.id).order("sort_order");
  return <main className="catalog-page shell"><Link className="catalog-back" href="/catalogo">← Catalogo</Link><article className="catalog-detail">{images?.length ? <div className="catalog-gallery">{images.map((image) => <div className="catalog-detail-media" key={image.id}><Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || data.name} fill sizes="(max-width: 560px) 100vw, 50vw" /></div>)}</div> : null}<p className="eyebrow dark">Attrezzatura</p><h1>{data.name}</h1><p>{data.description || "Soluzione professionale configurabile per il tuo evento."}</p>{data.included_accessories && <><h2>Accessori inclusi</h2><p>{data.included_accessories}</p></>}<Link className="cta" href="/richiesta">Richiedi una proposta</Link></article></main>;
}