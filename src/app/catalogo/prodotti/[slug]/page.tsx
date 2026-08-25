import { notFound } from "next/navigation";
import { CatalogProductDetail } from "@/components/catalog-product-detail";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select("id,name,description,included_accessories,category_id").eq("slug", slug).eq("active", true).not("published_at", "is", null).maybeSingle();
  if (!data) notFound();
  const [{ data: images }, { data: category }] = await Promise.all([
    supabase.from("product_images").select("id,storage_path,alt_text,sort_order").eq("product_id", data.id).order("sort_order").order("created_at"),
    data.category_id ? supabase.from("categories").select("name").eq("id", data.category_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return <CatalogProductDetail product={data} categoryName={category?.name ?? null} images={images ?? []} />;
}
