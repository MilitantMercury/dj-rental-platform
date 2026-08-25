"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { catalogMediaUrl } from "@/lib/catalog-media-url";

type ProductGalleryImage = { id: string; storage_path: string; alt_text: string | null };

export function ProductGallery({ images, productName, categoryName }: { images: ProductGalleryImage[]; productName: string; categoryName: string }) {
  const [active, setActive] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const count = images.length;
  const select = (index: number) => setActive((index + count) % count);
  if (!count) return <div className="catalog-owner-preview-media catalog-product-gallery is-empty"><span>{productName.slice(0, 2).toUpperCase()}</span><GalleryCaption categoryName={categoryName} /></div>;
  const image = images[active];
  return <section className="catalog-owner-preview-media catalog-product-gallery" aria-label={`Galleria immagini di ${productName}`} tabIndex={0} onKeyDown={event => {
    if (event.key === "ArrowLeft") { event.preventDefault(); select(active - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); select(active + 1); }
  }} onPointerDown={event => { pointerStart.current = event.clientX; }} onPointerUp={event => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 45) select(active + (distance < 0 ? 1 : -1));
  }}>
    <div className="catalog-product-gallery-stage">
      <Image key={image.id} src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text || `${productName}, immagine ${active + 1}`} fill priority={active === 0} quality={92} sizes="(max-width: 800px) 100vw, 52vw" />
      {count > 1 && <><button className="catalog-gallery-arrow is-prev" type="button" onClick={() => select(active - 1)} aria-label="Immagine precedente">←</button><button className="catalog-gallery-arrow is-next" type="button" onClick={() => select(active + 1)} aria-label="Immagine successiva">→</button><span className="catalog-gallery-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span></>}
    </div>
    {count > 1 && <div className="catalog-gallery-thumbnails" aria-label="Scegli immagine">{images.map((item, index) => <button key={item.id} className={index === active ? "is-active" : ""} type="button" onClick={() => select(index)} aria-label={`Mostra immagine ${index + 1}: ${item.alt_text || productName}`} aria-current={index === active ? "true" : undefined}><Image src={catalogMediaUrl(item.storage_path) ?? ""} alt="" fill sizes="84px" /></button>)}</div>}
    <GalleryCaption categoryName={categoryName} />
  </section>;
}

function GalleryCaption({ categoryName }: { categoryName: string }) {
  return <div className="catalog-detail-media-caption"><small>Selezione professionale</small><strong>{categoryName}</strong></div>;
}
