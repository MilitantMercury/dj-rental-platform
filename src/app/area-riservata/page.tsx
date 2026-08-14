import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../auth/actions";

export const dynamic = "force-dynamic";

export default async function AreaRiservata() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role, display_name").eq("user_id", user.id).maybeSingle();
  const role = staff?.role === "owner" ? "Owner" : staff?.role === "collaborator" ? "Collaboratore" : "Cliente";
  return <main className="dashboard shell"><p className="eyebrow dark">Area riservata</p><h1>Ciao.</h1><div className="dashboard-card"><p>Accesso verificato come <strong>{role}</strong>.</p><p>{user.email}</p><form action={signOut}><button type="submit">Esci</button></form></div></main>;
}
