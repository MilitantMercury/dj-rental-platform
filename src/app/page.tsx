import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const services = [
  { number: "01", title: "Attrezzatura selezionata", text: "Impianti audio, console, luci e accessori scelti in base allo spazio e al tipo di evento." },
  { number: "02", title: "Supporto professionale", text: "Servizi tecnici e DJ coordinati con le necessità reali della tua serata." },
  { number: "03", title: "Proposta su misura", text: "Una richiesta chiara, verificata dal gestore prima di qualsiasi conferma definitiva." },
] as const;

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = typeof user?.user_metadata?.first_name === "string" && user.user_metadata.first_name ? user.user_metadata.first_name : user?.email?.split("@")[0];
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav shell" aria-label="Navigazione principale">
          <a className="brand" href="#inizio" aria-label="Noleggio DJ, pagina iniziale">
            <span className="brand-mark" aria-hidden="true">ND</span>
            <span>Noleggio DJ</span>
          </a>
          <div className="nav-actions"><Link href="/catalogo">Catalogo</Link>{user ? <><Link href="/area-riservata">{displayName}</Link><Link className="nav-signup" href="/area-riservata">Area riservata</Link></> : <><Link href="/accesso">Accedi</Link><Link className="nav-signup" href="/registrazione">Registrati</Link></>}</div>
        </nav>

        <div id="inizio" className="hero-content shell">
          <p className="eyebrow">Attrezzatura e servizi professionali</p>
          <h1 id="hero-title">Il tuo evento,<br /><em>con il suono giusto.</em></h1>
          <p className="intro">Stiamo preparando un modo più semplice per raccontarci il tuo evento e ricevere una proposta costruita sulle tue esigenze.</p>
          <a className="cta" href="#come-funziona">Scopri come funzionerà <span aria-hidden="true">↓</span></a>
        </div>
        <div className="signal" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      </section>

      <section id="come-funziona" className="process shell" aria-labelledby="process-title">
        <div className="section-heading">
          <p className="eyebrow dark">Un servizio, non un carrello</p>
          <h2 id="process-title">Dalla richiesta<br />alla soluzione.</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.number}>
              <span className="service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
        <aside className="notice">
          <span aria-hidden="true">i</span>
          <p><strong>La richiesta non equivale a una prenotazione.</strong> Il gestore verifica disponibilità e dettagli, prepara il preventivo e conferma personalmente il noleggio.</p>
        </aside>
      </section>

      <footer className="footer"><div className="shell"><span>Noleggio DJ</span><p>Lingua italiana · Valuta EUR · Europe/Rome</p></div></footer>
    </main>
  );
}
