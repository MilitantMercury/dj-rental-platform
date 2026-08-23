import Image from "next/image";
import Link from "next/link";
import { catalogMediaUrl } from "@/lib/catalog-media";
import { createClient } from "@/lib/supabase/server";

const services = [
  { number: "01", title: "Attrezzatura selezionata", text: "Impianti audio, console, luci e accessori scelti in base allo spazio e al tipo di evento." },
  { number: "02", title: "Supporto professionale", text: "Servizi tecnici e DJ coordinati con le necessità reali della tua serata." },
  { number: "03", title: "Proposta su misura", text: "Una richiesta chiara, verificata dal gestore prima di qualsiasi conferma definitiva." },
] as const;

type FeaturedProduct = { id: string; name: string; slug: string; image: { storage_path: string; alt_text: string | null } };

export default async function Home() {
  const supabase = await createClient();
  const [{ data: products }, { data: productImages }, { data: publicSettings }] = await Promise.all([
    supabase.from("products").select("id,name,slug").eq("active", true).not("published_at", "is", null).order("sort_order").limit(3),
    supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").order("sort_order"),
    supabase.rpc("get_public_app_settings"),
  ]);
  const primaryImages = new Map<string, NonNullable<typeof productImages>[number]>();
  for (const image of productImages ?? []) if (!primaryImages.has(image.product_id)) primaryImages.set(image.product_id, image);
  const featured: FeaturedProduct[] = (products ?? []).flatMap(product => { const image = primaryImages.get(product.id); return image ? [{ ...product, image }] : []; }).slice(0, 2);
  return <HomeView featured={featured} intro={publicSettings?.[0]?.site_intro || undefined} publicName={publicSettings?.[0]?.public_name || undefined} />;
}

export function HomeView({ featured = [], intro = "Scegli attrezzatura e servizi professionali. Raccontaci il tuo evento e ricevi una proposta costruita davvero sulle tue esigenze.", publicName = "Noleggio DJ" }: { featured?: FeaturedProduct[]; intro?: string; publicName?: string }) {
  return <main>
    <section className="hero" aria-labelledby="hero-title"><div id="inizio" className="hero-content shell demo-hero-grid"><div className="demo-hero-copy"><p className="eyebrow">Attrezzatura e servizi professionali</p><h1 id="hero-title">Il tuo evento,<br /><em>con il suono giusto.</em></h1><p className="intro">{intro}</p><div className="hero-actions"><Link className="cta" href="/catalogo">Esplora il catalogo <span aria-hidden="true">→</span></Link><a className="cta cta-secondary" href="#come-funziona">Come funziona <span aria-hidden="true">↓</span></a></div><div className="demo-hero-trust"><span>Preventivo su misura</span><span>Conferma personale</span><span>Nessun pagamento online</span></div></div><div className="demo-hero-showcase" aria-label="Attrezzatura in evidenza">{featured.map((product,index)=><Link href={`/catalogo/prodotti/${product.slug}`} className={`demo-hero-product demo-hero-product-${index+1}`} key={product.id}><Image src={catalogMediaUrl(product.image.storage_path)??""} alt={product.image.alt_text||product.name} fill priority={index===0} sizes="(max-width: 900px) 80vw, 34vw"/><span><small>In evidenza</small><strong>{product.name}</strong></span></Link>)}{!featured.length&&<div className="demo-hero-placeholder"><strong>ND</strong><span>Il tuo setup,<br/>costruito bene.</span></div>}</div></div><div className="demo-hero-orbit" aria-hidden="true" /></section>
    <section id="come-funziona" className="process shell demo-process" aria-labelledby="process-title"><div className="section-heading"><p className="eyebrow dark">Un servizio, non un carrello</p><h2 id="process-title">Dalla richiesta<br />alla soluzione.</h2></div><div className="service-grid">{services.map(service=><article key={service.number}><span className="service-number">{service.number}</span><h3>{service.title}</h3><p>{service.text}</p></article>)}</div><aside className="notice"><span aria-hidden="true">i</span><p><strong>La richiesta non equivale a una prenotazione.</strong> Il gestore verifica disponibilità e dettagli, prepara il preventivo e conferma personalmente il noleggio.</p></aside></section>
    <footer className="footer"><div className="shell"><span>{publicName}</span><p>Attrezzatura e servizi per eventi · Europe/Rome</p></div></footer>
  </main>;
}
