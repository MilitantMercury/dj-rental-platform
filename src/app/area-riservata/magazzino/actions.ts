"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const path = "/area-riservata/magazzino";

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  return supabase;
}

export async function saveStock(data: FormData) {
  const productId = String(data.get("productId") ?? "");
  const quantity = Number(data.get("quantity"));
  if (!productId || !Number.isInteger(quantity) || quantity < 0) redirect(`${path}?message=quantita-non-valida`);
  const supabase = await requireOwner();
  const { error } = await supabase.from("inventory_stock").upsert({ product_id: productId, total_quantity: quantity });
  if (error) redirect(`${path}?message=giacenza-non-salvata`);
  revalidatePath(path);
  redirect(`${path}?message=giacenza-salvata`);
}

export async function addUnavailability(data: FormData) {
  const productId = String(data.get("productId") ?? "");
  const quantity = Number(data.get("quantity"));
  const startDate = String(data.get("startDate") ?? "");
  const endDate = String(data.get("endDate") ?? "");
  const reason = String(data.get("reason") ?? "").trim();
  const notes = String(data.get("notes") ?? "").trim();
  if (!productId || !Number.isInteger(quantity) || quantity < 1 || (endDate && !startDate) || (startDate && endDate && endDate < startDate)) redirect(`${path}?message=indisponibilita-non-valida`);
  const supabase = await requireOwner();
  const { error } = await supabase.from("inventory_unavailability").insert({ product_id: productId, quantity, start_date: startDate || null, end_date: endDate || null, reason, notes });
  if (error) redirect(`${path}?message=indisponibilita-non-salvata`);
  revalidatePath(path);
  redirect(`${path}?message=indisponibilita-salvata`);
}

export async function saveAvailabilitySettings(data: FormData) {
  const optionHours = Number(data.get("optionHours"));
  const marginDays = Number(data.get("marginDays"));
  if (!Number.isInteger(optionHours) || optionHours < 1 || optionHours > 720 || !Number.isInteger(marginDays) || marginDays < 0 || marginDays > 30) redirect(`${path}?message=configurazione-non-valida`);
  const supabase = await requireOwner();
  const { error } = await supabase.from("app_settings").upsert({ id: true, option_duration_hours: optionHours, operational_margin_days: marginDays, timezone: "Europe/Rome" });
  if (error) redirect(`${path}?message=configurazione-non-salvata`);
  revalidatePath(path);
  redirect(`${path}?message=configurazione-salvata`);
}
