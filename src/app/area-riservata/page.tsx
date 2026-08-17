import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../auth/actions";
export const dynamic = "force-dynamic";
export default async function AreaRiservata() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/accesso");
  const [staffResult, profileResult, customerResult] = await Promise.all([
    supabase.from("staff_profiles").select("role,display_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("customer_profiles").select("customer_type,company_name").eq("user_id", user.id).maybeSingle(),
  ]);
  const staff = staffResult.data;
  const profile = profileResult.data;
  const customer = customerResult.data;
  const role = staff?.role === "owner" ? "Owner" : staff?.role === "collaborator" ? "Collaboratore" : "Cliente";
  const customerName = customer?.customer_type === "business"
    ? customer.company_name || "Bentornato"
    : profile?.first_name || "Bentornato";
  const name = staff?.display_name ?? customerName;
  return <main className="dashboard shell reserved-page"><p className="eyebrow dark">Area riservata</p><div className="reserved-header"><h1>Il tuo spazio.</h1></div><section className="reserved-card"><div className="reserved-welcome"><div><h2>Ciao, {name}.</h2><p className="reserved-email">{user.email}</p></div><span className="reserved-role">{role}</span></div>{staff?.role ? <div className="reserved-actions"><Link className="dashboard-link" href="/area-riservata/pratiche">Gestisci pratiche →</Link>{staff.role === "owner" && <><Link className="dashboard-link" href="/area-riservata/catalogo">Gestisci catalogo →</Link><Link className="dashboard-link" href="/area-riservata/configurazione/eventi">Tipi di evento →</Link></>}</div> : <div className="reserved-actions"><Link className="dashboard-link" href="/area-riservata/richieste">Le mie richieste →</Link><Link className="dashboard-link" href="/area-riservata/preventivi">I miei preventivi →</Link></div>}<div className="reserved-logout"><form action={signOut}><button type="submit">Esci dall’account</button></form></div></section></main>;
}
