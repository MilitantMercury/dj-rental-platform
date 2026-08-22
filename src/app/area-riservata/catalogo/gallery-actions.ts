"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const destination = (message: string): never => redirect(`/area-riservata/catalogo?message=${encodeURIComponent(message)}`);

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  return supabase;
}

export async function setProductCover(data: FormData) {
  const imageId = String(data.get("imageId") ?? "");
  const productId = String(data.get("productId") ?? "");
  const supabase = await requireOwner();
  const [{ data: image }, { data: firstImage }] = await Promise.all([
    supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle(),
    supabase.from("product_images").select("sort_order").eq("product_id", productId).order("sort_order").limit(1).maybeSingle(),
  ]);
  if (!image) destination("Immagine prodotto non valida.");
  const { error } = await supabase.from("product_images").update({ sort_order: (firstImage?.sort_order ?? 0) - 10 }).eq("id", imageId).eq("product_id", productId);
  if (error) destination("Copertina non aggiornata.");
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
  destination("Copertina aggiornata.");
}

export async function removeProductImage(data: FormData) {
  const imageId = String(data.get("imageId") ?? "");
  const productId = String(data.get("productId") ?? "");
  const supabase = await requireOwner();
  const { data: image } = await supabase.from("product_images").select("storage_path").eq("id", imageId).eq("product_id", productId).maybeSingle();
  const storagePath = image?.storage_path;
  if (!storagePath) destination("Immagine prodotto non valida.");
  const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  if (error) destination("Immagine non rimossa.");
  await supabase.storage.from("catalog").remove([storagePath!]);
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
  destination("Immagine rimossa.");
}
export async function moveProductImage(data: FormData) {
  const imageId = String(data.get("imageId") ?? "");
  const productId = String(data.get("productId") ?? "");
  const direction = Number(data.get("direction"));
  if (!/^[0-9a-f-]{36}$/.test(imageId) || !/^[0-9a-f-]{36}$/.test(productId) || ![-1, 1].includes(direction)) destination("Ordinamento immagine non valido.");
  const supabase = await requireOwner();
  const { data: image } = await supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (!image) destination("Immagine prodotto non valida.");
  const { error } = await supabase.rpc("move_catalog_item", { target_type: "product_images", target_id: imageId, direction });
  if (error) destination("Ordinamento immagini non aggiornato.");
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
}
