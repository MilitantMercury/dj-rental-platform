import Image from "next/image";
import Link from "next/link";
import { AmbientMotionCanvas } from "@/components/ambient-motion-canvas";
import { JourneyProgress } from "@/components/journey-progress";
import { createClient } from "@/lib/supabase/server";

const journeySteps = [
  { number: "01", kind: "profile", label: "Entra", title: "Registrati", text: "Crea il tuo profilo: bastano i dati necessari per preparare la richiesta." },
  { number: "02", kind: "setup", label: "Scegli", title: "Componi il setup", text: "Seleziona attrezzatura e servizi dal catalogo, senza pagare online." },
  { number: "03", kind: "check", label: "Prepariamo", title: "Verifichiamo tutto", text: "Controlliamo disponibilità, compatibilità e dettagli del tuo evento." },
  { number: "04", kind: "route", label: "Ci siamo", title: "Consegna o ritiro", text: "Scegli se ricevere il materiale oppure passare a ritirarlo in sede." },
] as const;

type FeaturedProduct = { id: string; name: string; slug: string };

export default async function Home() {
  const supabase = await createClient();
  const [{ data: products }, { data: publicSettings }] = await Promise.all([
    supabase.from("products").select("id,name,slug").eq("active", true).not("published_at", "is", null).order("sort_order").limit(3),
    supabase.rpc("get_public_app_settings"),
  ]);
  const featured: FeaturedProduct[] = products ?? [];
  return <HomeView featured={featured} intro={publicSettings?.[0]?.site_intro || undefined} />;
}

export function HomeView({ featured = [], intro = "Scegli attrezzatura e servizi professionali. Raccontaci il tuo evento e ricevi una proposta costruita davvero sulle tue esigenze." }: { featured?: FeaturedProduct[]; intro?: string }) {
  return <main>
    <section className="hero wow-hero" aria-labelledby="hero-title">
      <div className="wow-hero-media" aria-hidden="true"><Image src="/images/homepage-dj-sharp-4k.webp" alt="" fill priority quality={92} sizes="100vw" /></div>
      <div className="wow-hero-shade" aria-hidden="true" />
      <div className="wow-hero-beam wow-hero-beam-one" aria-hidden="true" />
      <div className="wow-hero-beam wow-hero-beam-two" aria-hidden="true" />
      <div className="wow-hero-energy" aria-hidden="true"><i /><i /><i /><b /><b /><b /><b /><b /></div>
      <div id="inizio" className="hero-content shell wow-hero-grid">
        <div className="demo-hero-copy wow-hero-copy">
          <p className="eyebrow"><span className="wow-live-dot" aria-hidden="true" />Attrezzatura e servizi professionali</p>
          <h1 id="hero-title">Il tuo evento.<br /><em>Il momento</em><br />che resta.</h1>
          <p className="intro">{intro}</p>
          <div className="hero-actions"><Link className="cta" href="/catalogo">Costruisci il tuo evento <span aria-hidden="true">→</span></Link><a className="cta cta-secondary" href="#come-funziona">Scopri come funziona <span aria-hidden="true">↓</span></a></div>
          <div className="demo-hero-trust"><span>Preventivo su misura</span><span>Conferma personale</span><span>Nessun pagamento online</span></div>
        </div>
        <div className="wow-hero-stage" aria-label="Esperienza Noleggio DJ">
          <div className="wow-equalizer" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
          {featured[0] ? <Link href={`/catalogo/prodotti/${featured[0].slug}`} className="wow-featured-card"><span>Scelto per te</span><strong>{featured[0].name}</strong><small>Scopri l’attrezzatura <b aria-hidden="true">↗</b></small></Link> : <div className="wow-featured-card"><span>Il tuo setup</span><strong>Suono, luci, atmosfera.</strong><small>Costruito intorno al tuo evento</small></div>}
        </div>
      </div>
      <div className="wow-scroll-cue" aria-hidden="true"><span>Scorri</span><i /></div>
    </section>
    <section id="come-funziona" className="wow-story" aria-labelledby="process-title">
      <div className="shell wow-story-heading"><div><p className="eyebrow dark">Dal backstage al tuo evento</p><h2 id="process-title">Non noleggi oggetti.<br /><em>Costruisci un’atmosfera.</em></h2></div><p>Ogni evento parte da un’idea. Il nostro lavoro è trasformarla nel setup giusto, senza automatismi e senza sorprese.</p></div>
      <div className="shell wow-story-scene">
        <Image src="/images/homepage-production-scene.webp" alt="Tecnici al lavoro durante la preparazione di audio e luci per un evento" fill sizes="(max-width: 1200px) 100vw, 1180px" />
        <AmbientMotionCanvas />
        <div className="wow-story-caption"><span>Preparazione reale</span><strong>Ogni dettaglio<br />prima che inizi.</strong></div>
      </div>
      <div className="shell wow-journey" aria-label="Come funziona il servizio">
        <JourneyProgress />
        {journeySteps.map(step => <article key={step.number}>
          <div className="wow-journey-node" aria-hidden="true"><span>{step.number}</span><i /></div>
          <small>{step.label}</small>
          <div className={`wow-journey-visual is-${step.kind}`} aria-hidden="true"><i /><i /><i /><i /><b /><b /></div>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>)}
        <div className="wow-journey-choice" aria-hidden="true"><span>Consegna</span><b>oppure</b><span>Ritiro</span></div>
      </div>
      <div className="shell wow-story-close"><div><p className="eyebrow">Niente checkout automatico</p><h2>Una persona verifica.<br /><em>Tu scegli tranquillo.</em></h2></div><div><p><strong>La richiesta non equivale a una prenotazione.</strong> Disponibilità, compatibilità e dettagli operativi vengono controllati prima della proposta finale.</p><Link className="cta" href="/catalogo">Inizia dal catalogo <span aria-hidden="true">→</span></Link></div></div>
    </section>
  </main>;
}
