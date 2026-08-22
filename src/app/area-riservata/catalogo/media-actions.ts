"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { catalogImagePath, validateCatalogImage, type CatalogMediaKind } from "@/lib/catalog-media";
import { createClient } from "@/lib/supabase/server";

const fail = (message: string): never => redirect(`/area-riservata/catalogo?message=${encodeURIComponent(message)}`);

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  return supabase;
}

export async function uploadCatalogImage(data: FormData) {
  const kind = String(data.get("kind") ?? "") as CatalogMediaKind;
  const entityId = String(data.get("entityId") ?? "");
  const altText = String(data.get("altText") ?? "").trim().slice(0, 250);
  if (!(["categories", "products", "services"] as string[]).includes(kind) || !/^[0-9a-f-]{36}$/.test(entityId)) fail("Elemento catalogo non valido.");
  const image = validateCatalogImage(data.get("image"));
  if (image.error || !image.file || !image.extension) fail(image.error ?? "Seleziona un’immagine.");
  const file = image.file as File;
  const extension = image.extension as string;
  const supabase = await requireOwner();
  const path = catalogImagePath(kind, entityId, extension);
  const { error: uploadError } = await supabase.storage.from("catalog").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) fail("Caricamento non riuscito. Usa JPEG, PNG, WebP o AVIF entro 5 MB.");

  const mutation = kind === "categories"
    ? await supabase.from("categories").update({ image_path: path, image_alt: altText }).eq("id", entityId).select("id").maybeSingle()
    : kind === "services"
      ? await supabase.from("services").update({ image_path: path, image_alt: altText }).eq("id", entityId).select("id").maybeSingle()
      : await supabase.from("product_images").insert({ product_id: entityId, storage_path: path, alt_text: altText, sort_order: 0 }).select("id").maybeSingle();
  if (mutation.error || !mutation.data) {
    await supabase.storage.from("catalog").remove([path]);
    fail("Immagine caricata ma non associata all’elemento.");
  }
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
  redirect("/area-riservata/catalogo?message=Immagine%20caricata.");
}
