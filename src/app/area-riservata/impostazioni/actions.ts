"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

const path = "/area-riservata/impostazioni";
const value = (data: FormData, key: string, max = 2000) => String(data.get(key) ?? "").trim().slice(0, max);
const checked = (data: FormData, key: string) => data.get(key) === "on";

async function ownerClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (staff?.role !== "owner") redirect("/area-riservata");
  return supabase;
}

async function save(values: Database["public"]["Tables"]["app_settings"]["Update"], success: string) {
  const supabase = await ownerClient();
  const { error } = await supabase.from("app_settings").update(values).eq("id", true);
  if (error) redirect(`${path}?message=Impostazioni non salvate.`);
  revalidatePath(path);
  revalidatePath("/"); revalidatePath("/richiesta");
  redirect(`${path}?message=${encodeURIComponent(success)}`);
}

export async function saveOwnerSettings(data: FormData) {
  const optionHours = Number(data.get("optionHours")); const marginDays = Number(data.get("marginDays"));
  if (!Number.isInteger(optionHours) || optionHours < 1 || optionHours > 720 || !Number.isInteger(marginDays) || marginDays < 0 || marginDays > 30) redirect(`${path}?message=Impostazioni non valide.`);
  await save({ option_duration_hours: optionHours, operational_margin_days: marginDays, timezone: "Europe/Rome" }, "Regole aggiornate.");
}

export async function saveCommunicationSettings(data: FormData) {
  const senderName = value(data, "senderName", 100);
  if (!senderName) redirect(`${path}?message=Inserisci il nome del mittente.`);
  await save({ sender_name: senderName, sender_email: value(data, "senderEmail", 254), owner_notification_email: value(data, "ownerNotificationEmail", 254), notify_new_requests: checked(data, "notifyNewRequests"), notify_quote_responses: checked(data, "notifyQuoteResponses"), notify_operational_updates: checked(data, "notifyOperationalUpdates") }, "Comunicazioni aggiornate.");
}

export async function saveLogisticsSettings(data: FormData) {
  const pickup = checked(data, "pickupEnabled"); const delivery = checked(data, "deliveryEnabled");
  if (!pickup && !delivery) redirect(`${path}?message=Abilita almeno una modalità logistica.`);
  const street = value(data, "pickupAddressStreet", 160);
  const number = value(data, "pickupAddressNumber", 20);
  const postalCode = value(data, "pickupAddressPostalCode", 5);
  const city = value(data, "pickupAddressCity", 100);
  const province = value(data, "pickupAddressProvince", 2).toUpperCase();
  const country = value(data, "pickupAddressCountry", 100) || "Italia";
  if (pickup && (!street || !number || !/^[0-9]{5}$/.test(postalCode) || !city || !/^[A-Z]{2}$/.test(province))) redirect(`${path}?message=Completa correttamente l’indirizzo di ritiro.`);
  const formattedAddress = street ? `${street} ${number}, ${postalCode} ${city}${province ? ` (${province})` : ""}, ${country}` : "";
  await save({ pickup_enabled: pickup, delivery_enabled: delivery, pickup_address: formattedAddress, pickup_address_street: street, pickup_address_number: number, pickup_address_postal_code: postalCode, pickup_address_city: city, pickup_address_province: province, pickup_address_country: country, pickup_instructions: value(data, "pickupInstructions") }, "Logistica aggiornata.");
}

export async function saveIdentitySettings(data: FormData) {
  const publicName = value(data, "publicName", 100);
  if (!publicName) redirect(`${path}?message=Inserisci il nome pubblico.`);
  await save({ public_name: publicName, public_email: value(data, "publicEmail", 254), public_phone: value(data, "publicPhone", 40), whatsapp_url: value(data, "whatsappUrl", 500), instagram_url: value(data, "instagramUrl", 500), facebook_url: value(data, "facebookUrl", 500), site_intro: value(data, "siteIntro", 1000) }, "Identità pubblica aggiornata.");
}
