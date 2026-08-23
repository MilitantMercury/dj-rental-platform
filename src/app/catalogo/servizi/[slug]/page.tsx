import { notFound } from "next/navigation";
import { CatalogServiceDetail } from "@/components/catalog-service-detail";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("services").select("id,name,description,conditions,image_path,image_alt,category_id").eq("slug", slug).eq("active", true).not("published_at", "is", null).maybeSingle();
  if (!data) notFound();
  const { data: category } = data.category_id ? await supabase.from("categories").select("name").eq("id", data.category_id).maybeSingle() : { data: null };
  return <CatalogServiceDetail service={data} categoryName={category?.name ?? null} />;
}
