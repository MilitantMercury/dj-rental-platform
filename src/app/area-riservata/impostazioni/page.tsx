import Link from "next/link";
import { redirect } from "next/navigation";
import { AppMessage } from "@/components/app-message";
import { OwnerSettingsPanel } from "@/components/owner-settings-panel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OwnerSettingsPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const [{ data: staff }, { data: settings }, params] = await Promise.all([
    supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle(),
    supabase.from("app_settings").select("*").eq("id", true).maybeSingle(),
    searchParams,
  ]);
  if (staff?.role !== "owner") redirect("/area-riservata");
  if (!settings) throw new Error("Impostazioni applicazione non disponibili.");
  return <main className="dashboard shell owner-settings-page"><header className="owner-settings-hero"><div><p className="eyebrow dark">Area owner</p><h1>Impostazioni.</h1><p>Ogni modifica viene applicata subito, senza stati intermedi.</p></div><Link className="catalog-back" href="/area-riservata">← Area riservata</Link></header>{params.message && <AppMessage message={params.message} />}<OwnerSettingsPanel settings={settings} /></main>;
}
