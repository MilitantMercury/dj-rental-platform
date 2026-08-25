"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_IMAGE_TOO_SMALL_MESSAGE, MAX_PRODUCT_GALLERY_IMAGES, catalogImagePath, hasValidCatalogImageSignature, nextProductImageSortOrder, optimizeCatalogImage, validateCatalogImage, type CatalogMediaKind } from "@/lib/catalog-media";
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
  if (!(await hasValidCatalogImageSignature(file, extension))) fail("Contenuto immagine non valido.");
  const supabase = await requireOwner();
  let optimizedImage: Buffer;
  try { optimizedImage = await optimizeCatalogImage(file); }
  catch (error) { return fail(error instanceof Error && error.message === CATALOG_IMAGE_TOO_SMALL_MESSAGE ? error.message : "L’immagine non è valida o non può essere elaborata."); }

  const currentProductImages = kind === "products"
    ? (await supabase.from("product_images").select("id,sort_order").eq("product_id", entityId).order("sort_order", { ascending: false }).limit(MAX_PRODUCT_GALLERY_IMAGES)).data ?? []
    : [];
  const productSortOrder = kind === "products" ? nextProductImageSortOrder(currentProductImages) : null;
  if (kind === "products" && productSortOrder === null) fail(`La galleria può contenere al massimo ${MAX_PRODUCT_GALLERY_IMAGES} immagini.`);
  const previousPath = kind === "categories"
    ? (await supabase.from("categories").select("image_path").eq("id", entityId).maybeSingle()).data?.image_path
    : kind === "services"
      ? (await supabase.from("services").select("image_path").eq("id", entityId).maybeSingle()).data?.image_path
      : null;
  const path = catalogImagePath(kind, entityId, "webp");
  const { error: uploadError } = await supabase.storage.from("catalog").upload(path, optimizedImage, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (uploadError) fail("Caricamento non riuscito. Usa JPEG, PNG, WebP o AVIF entro 5 MB.");

  const mutation = kind === "categories"
    ? await supabase.from("categories").update({ image_path: path, image_alt: altText }).eq("id", entityId).select("id").maybeSingle()
    : kind === "services"
      ? await supabase.from("services").update({ image_path: path, image_alt: altText }).eq("id", entityId).select("id").maybeSingle()
      : await supabase.from("product_images").insert({ product_id: entityId, storage_path: path, alt_text: altText, sort_order: productSortOrder! }).select("id").maybeSingle();
  if (mutation.error || !mutation.data) {
    console.error("Catalog media association failed", JSON.stringify({
      kind,
      entityId,
      code: mutation.error?.code,
      message: mutation.error?.message,
      details: mutation.error?.details,
      hint: mutation.error?.hint,
    }));
    await supabase.storage.from("catalog").remove([path]);
    fail("Immagine caricata ma non associata all’elemento.");
  }
  if (previousPath && previousPath !== path) await supabase.storage.from("catalog").remove([previousPath]);
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
  redirect("/area-riservata/catalogo?message=Immagine%20ottimizzata%20e%20caricata.");
}
