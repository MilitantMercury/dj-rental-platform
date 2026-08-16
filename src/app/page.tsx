
const services = [
  { number: "01", title: "Attrezzatura selezionata", text: "Impianti audio, console, luci e accessori scelti in base allo spazio e al tipo di evento." },
  { number: "02", title: "Supporto professionale", text: "Servizi tecnici e DJ coordinati con le necessità reali della tua serata." },
  { number: "03", title: "Proposta su misura", text: "Una richiesta chiara, verificata dal gestore prima di qualsiasi conferma definitiva." },
] as const;

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div id="inizio" className="hero-content shell">
          <p className="eyebrow">Attrezzatura e servizi professionali</p>
          <h1 id="hero-title">Il tuo evento,<br /><em>con il suono giusto.</em></h1>
          <p className="intro">Stiamo preparando un modo più semplice per raccontarci il tuo evento e ricevere una proposta costruita sulle tue esigenze.</p>
          <div className="hero-actions"><a className="cta" href="/catalogo">Esplora il catalogo <span aria-hidden="true">→</span></a><a className="cta cta-secondary" href="#come-funziona">Come funziona <span aria-hidden="true">↓</span></a></div>
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
