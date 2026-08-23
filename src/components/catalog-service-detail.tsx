import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { catalogMediaUrl } from "@/lib/catalog-media";

type CatalogServiceDetailProps = {
  service: { id: string; name: string; description: string | null; conditions: string | null; image_path: string | null; image_alt: string | null };
  categoryName: string | null;
};

export function CatalogServiceDetail({ service, categoryName }: CatalogServiceDetailProps) {
  const description = !service.description || /^descrizione\b/i.test(service.description.trim()) ? "Un servizio professionale costruito intorno al programma e allo stile del tuo evento." : service.description;
  return <main className="catalog-public-detail shell">
    <nav className="catalog-public-detail-nav" aria-label="Percorso nel catalogo">
      <Link className="catalog-back" href="/catalogo">← Torna al catalogo</Link>
      <span>Servizi / {categoryName ?? "Senza categoria"}</span>
    </nav>
    <article className="catalog-owner-preview-card is-services catalog-public-detail-card">
      <div className="catalog-owner-preview-media">{service.image_path ? <Image src={catalogMediaUrl(service.image_path) ?? ""} alt={service.image_alt || service.name} fill priority sizes="(max-width: 800px) 100vw, 52vw" /> : <span>{service.name.slice(0, 2).toUpperCase()}</span>}</div>
      <div className="catalog-owner-preview-copy">
        <div className="catalog-owner-preview-meta"><span>Servizio</span><span>{categoryName ?? "Supporto professionale"}</span></div>
        <h1>{service.name}</h1>
        <section className="catalog-public-detail-description"><small>Descrizione</small><p className="catalog-owner-preview-description">{description}</p></section>
        <div className="catalog-public-detail-actions"><AddToCart id={service.id} name={service.name} type="service" /><Link href="/richiesta">Prepara la richiesta <span aria-hidden="true">↗</span></Link></div>
        <p className="catalog-public-detail-note">L’aggiunta al carrello non costituisce una prenotazione. Dettagli e disponibilità saranno verificati nella proposta.</p>
      </div>
    </article>
    {service.conditions && <section className="catalog-owner-preview-info catalog-public-detail-info"><p className="eyebrow dark">Dettagli del servizio</p><h2>Condizioni</h2><p>{service.conditions}</p></section>}
  </main>;
}
