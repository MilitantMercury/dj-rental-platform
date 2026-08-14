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
