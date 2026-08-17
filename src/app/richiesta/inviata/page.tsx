import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RequestSentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  return <main className="auth-shell"><section className="auth-card request-card request-sent-card"><p className="eyebrow">Richiesta ricevuta</p><h1>Richiesta inviata.</h1><p>Grazie. Il gestore verificherà i dettagli e ti ricontatterà con una proposta.</p><div className="request-sent-actions"><Link className="dashboard-link" href="/area-riservata">Vai all’area riservata →</Link><Link href="/catalogo">Torna al catalogo</Link></div></section></main>;
}
