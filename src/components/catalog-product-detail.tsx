import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { catalogMediaUrl } from "@/lib/catalog-media";

type CatalogProductDetailProps = {
  product: { id: string; name: string; description: string | null; included_accessories: string | null };
  categoryName: string | null;
  image: { storage_path: string; alt_text: string | null } | null;
};

export function CatalogProductDetail({ product, categoryName, image }: CatalogProductDetailProps) {
  return <main className="catalog-public-detail shell">
    <nav className="catalog-public-detail-nav" aria-label="Percorso nel catalogo">
      <Link className="catalog-back" href="/catalogo">← Torna al catalogo</Link>
      <span>Attrezzatura / {categoryName ?? "Senza categoria"}</span>
    </nav>
    <article className="catalog-owner-preview-card is-products catalog-public-detail-card">
      <div className="catalog-owner-preview-media">{image ? <Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || product.name} fill priority sizes="(max-width: 800px) 100vw, 52vw" /> : <span>{product.name.slice(0, 2).toUpperCase()}</span>}</div>
      <div className="catalog-owner-preview-copy">
        <div className="catalog-owner-preview-meta"><span>Prodotto</span><span>{categoryName ?? "Attrezzatura"}</span></div>
        <h1>{product.name}</h1>
        <section className="catalog-public-detail-description"><small>Descrizione</small><p className="catalog-owner-preview-description">{product.description || "Soluzione professionale configurabile per il tuo evento."}</p></section>
        {product.included_accessories && <section className="catalog-public-detail-included"><small>Materiale incluso</small><p>{product.included_accessories}</p></section>}
        <div className="catalog-public-detail-actions"><AddToCart id={product.id} name={product.name} /><Link href="/richiesta">Prepara la richiesta <span aria-hidden="true">↗</span></Link></div>
        <p className="catalog-public-detail-note">L’aggiunta al carrello non costituisce una prenotazione. Riceverai una proposta su misura.</p>
      </div>
    </article>
  </main>;
}
