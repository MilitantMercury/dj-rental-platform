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
  const { data: image } = await supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (!image) destination("Immagine prodotto non valida.");
  await supabase.from("product_images").update({ sort_order: 1 }).eq("product_id", productId);
  const { error } = await supabase.from("product_images").update({ sort_order: 0 }).eq("id", imageId).eq("product_id", productId);
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
