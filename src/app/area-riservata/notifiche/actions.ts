"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  return supabase;
}

export async function markNotificationRead(data: FormData) {
  const notificationId = String(data.get("notificationId") ?? "");
  if (!notificationId) return;
  const supabase = await requireUser();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).is("read_at", null);
  revalidatePath("/", "layout");
  revalidatePath("/area-riservata/notifiche");
}

export async function markAllNotificationsRead() {
  const supabase = await requireUser();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  revalidatePath("/", "layout");
  revalidatePath("/area-riservata/notifiche");
}
