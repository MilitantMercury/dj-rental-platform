"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
const path = "/area-riservata/impostazioni/collaboratori";
const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
async function requireOwner() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/accesso"); const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle(); if (staff?.role !== "owner") redirect("/area-riservata"); return { supabase, user }; }
export async function inviteCollaborator(data: FormData) {
  const email = text(data, "email").toLowerCase(); const displayName = text(data, "displayName").slice(0, 100);
  if (!email || !displayName) redirect(`${path}?message=Nome ed email sono obbligatori.`);
  const { supabase } = await requireOwner(); const admin = createAdminClient();
  if (!admin) redirect(`${path}?message=Inviti non configurati: aggiungi SUPABASE_SECRET_KEY al server.`);
  const { data: invitation, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${getAppUrl()}/nuova-password`, data: { first_name: displayName } });
  if (error || !invitation.user) redirect(`${path}?message=Invito non inviato. Verifica che l’email non sia già registrata.`);
  const { error: profileError } = await supabase.from("staff_profiles").upsert({ user_id: invitation.user.id, role: "collaborator", display_name: displayName, active: true });
  if (profileError) redirect(`${path}?message=Invito inviato, ma profilo collaboratore non creato.`);
  revalidatePath(path); redirect(`${path}?message=Collaboratore invitato.`);
}
export async function updateCollaborator(data: FormData) {
  const userId = text(data, "userId"); const displayName = text(data, "displayName").slice(0, 100); const active = data.get("active") === "true";
  if (!userId || !displayName) redirect(`${path}?message=Dati collaboratore non validi.`);
  const { supabase, user } = await requireOwner(); if (userId === user.id) redirect(`${path}?message=Non puoi modificare il tuo ruolo da questa pagina.`);
  const { error } = await supabase.from("staff_profiles").update({ display_name: displayName, active }).eq("user_id", userId).eq("role", "collaborator");
  if (error) redirect(`${path}?message=Collaboratore non aggiornato.`);
  revalidatePath(path); redirect(`${path}?message=Collaboratore aggiornato.`);
}
