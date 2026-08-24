import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { AmbientMotionCanvas } from "@/components/ambient-motion-canvas";
import { catalogMediaUrl } from "@/lib/catalog-media";

type CatalogProductDetailProps = {
  product: { id: string; name: string; description: string | null; included_accessories: string | null };
  categoryName: string | null;
  image: { storage_path: string; alt_text: string | null } | null;
};

export function CatalogProductDetail({ product, categoryName, image }: CatalogProductDetailProps) {
  const description = !product.description || /^descrizione\b/i.test(product.description.trim()) ? "Attrezzatura professionale selezionata e configurata in base alle esigenze del tuo evento." : product.description;
  const included = product.included_accessories?.trim() || null;
  return <main className="catalog-public-detail">
    <AmbientMotionCanvas className="catalog-detail-canvas" />
    <div className="shell catalog-public-detail-shell">
      <nav className="catalog-public-detail-nav" aria-label="Percorso nel catalogo">
        <Link className="catalog-back" href="/catalogo">← Torna al catalogo</Link>
        <span>Attrezzatura / {categoryName ?? "Senza categoria"}</span>
      </nav>
      <article className="catalog-owner-preview-card is-products catalog-public-detail-card">
        <div className="catalog-owner-preview-media">{image ? <Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || product.name} fill priority sizes="(max-width: 800px) 100vw, 52vw" /> : <span>{product.name.slice(0, 2).toUpperCase()}</span>}<div className="catalog-detail-media-caption"><small>Selezione professionale</small><strong>{categoryName ?? "Attrezzatura"}</strong></div></div>
        <div className="catalog-owner-preview-copy">
          <div className="catalog-owner-preview-meta"><span>Prodotto</span><span>{categoryName ?? "Attrezzatura"}</span></div>
          <p className="catalog-detail-kicker">Il tuo setup, senza compromessi.</p>
          <h1>{product.name}</h1>
          <div className="catalog-detail-information">
            <section className="catalog-public-detail-description"><small>Descrizione</small><p className="catalog-owner-preview-description">{description}</p></section>
            {included && <section className="catalog-public-detail-included"><small>Materiale incluso</small><p>{included}</p></section>}
          </div>
          <div className="catalog-public-detail-actions"><AddToCart id={product.id} name={product.name} /><Link href="/richiesta">Prepara la richiesta <span aria-hidden="true">↗</span></Link></div>
          <p className="catalog-public-detail-note"><span aria-hidden="true">✓</span> Nessun pagamento ora. L’aggiunta al carrello non costituisce una prenotazione.</p>
        </div>
      </article>
      <aside className="catalog-detail-assurance" aria-label="Come funziona la richiesta"><span>01 <strong>Scegli</strong></span><span>02 <strong>Raccontaci l’evento</strong></span><span>03 <strong>Ricevi la proposta</strong></span></aside>
    </div>
  </main>;
}
