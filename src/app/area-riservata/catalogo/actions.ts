"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const positiveInt = (data: FormData, key: string) => { const raw = text(data, key); if (!raw) return null; const value = Number.parseInt(raw, 10); return Number.isInteger(value) && value >= 0 ? value : null; };
const error = (message: string): never => redirect(`/area-riservata/catalogo?message=${encodeURIComponent(message)}`);

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  return supabase;
}

export async function createCategory(data: FormData) {
  const supabase = await requireOwner();
  const { error: insertError } = await supabase.from("categories").insert({ name: text(data, "name"), slug: text(data, "slug"), description: text(data, "description") || null, image_path: null, parent_id: text(data, "parentId") || null, sort_order: positiveInt(data, "sortOrder") ?? 0, active: true });
  if (insertError) error("Categoria non creata: controlla nome e slug.");
  revalidatePath("/area-riservata/catalogo");
}

export async function createProduct(data: FormData) {
  const supabase = await requireOwner();
  const { error: insertError } = await supabase.from("products").insert({ name: text(data, "name"), slug: text(data, "slug"), category_id: text(data, "categoryId") || null, description: text(data, "description"), included_accessories: text(data, "includedAccessories"), reference_price_cents: positiveInt(data, "referencePriceCents"), specifications: {}, active: true });
  if (insertError) error("Prodotto non creato: controlla nome, slug e importo.");
  revalidatePath("/area-riservata/catalogo");
}

export async function createService(data: FormData) {
  const supabase = await requireOwner();
  const { error: insertError } = await supabase.from("services").insert({ name: text(data, "name"), slug: text(data, "slug"), category_id: text(data, "categoryId") || null, description: text(data, "description"), conditions: text(data, "conditions"), reference_price_cents: positiveInt(data, "referencePriceCents"), active: true });
  if (insertError) error("Servizio non creato: controlla nome, slug e importo.");
  revalidatePath("/area-riservata/catalogo");
}

export async function toggleCatalogItem(data: FormData) {
  const supabase = await requireOwner();
  const table = text(data, "table");
  const id = text(data, "id");
  const active = text(data, "active") === "true";
  if (table !== "categories" && table !== "products" && table !== "services") error("Elemento catalogo non valido.");
  const updateError = table === "categories"
    ? (await supabase.from("categories").update({ active: !active }).eq("id", id)).error
    : table === "products"
      ? (await supabase.from("products").update({ active: !active }).eq("id", id)).error
      : (await supabase.from("services").update({ active: !active }).eq("id", id)).error;
  if (updateError) error("Stato non aggiornato.");
  revalidatePath("/area-riservata/catalogo");
}
export async function toggleCatalogPublication(data: FormData) {
  const supabase = await requireOwner();
  const table = text(data, "table");
  const id = text(data, "id");
  const published = text(data, "published") === "true";
  if (table !== "categories" && table !== "products" && table !== "services") error("Elemento catalogo non valido.");
  const values = { published_at: published ? null : new Date().toISOString(), ...(!published ? { active: true } : {}) };
  const updateError = table === "categories"
    ? (await supabase.from("categories").update(values).eq("id", id)).error
    : table === "products"
      ? (await supabase.from("products").update(values).eq("id", id)).error
      : (await supabase.from("services").update(values).eq("id", id)).error;
  if (updateError) error("Pubblicazione non aggiornata.");
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
  error(published ? "Elemento riportato in bozza." : "Elemento pubblicato.");
}

export async function moveCatalogItem(data: FormData) {
  const supabase = await requireOwner();
  const targetType = text(data, "table");
  const targetId = text(data, "id");
  const direction = Number(text(data, "direction"));
  if (!["categories", "products", "services"].includes(targetType) || !/^[0-9a-f-]{36}$/.test(targetId) || ![-1, 1].includes(direction)) error("Ordinamento non valido.");
  const { error: moveError } = await supabase.rpc("move_catalog_item", { target_type: targetType, target_id: targetId, direction });
  if (moveError) error("Ordinamento non aggiornato.");
  revalidatePath("/catalogo");
  revalidatePath("/area-riservata/catalogo");
}
