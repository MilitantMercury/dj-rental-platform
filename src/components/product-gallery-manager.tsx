"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { moveProductImage, removeProductImage, reorderProductImages, setProductCover } from "@/app/area-riservata/catalogo/gallery-actions";
import { catalogMediaUrl } from "@/lib/catalog-media-url";

type GalleryImage = { id: string; storage_path: string; alt_text: string; sort_order: number };

export function ProductGalleryManager({ productId, images }: { productId: string; images: GalleryImage[] }) {
  const [ordered, setOrdered] = useState(images);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!ordered.length) return null;
  const dropOn = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const next = [...ordered];
    const sourceIndex = next.findIndex(image => image.id === draggedId);
    const targetIndex = next.findIndex(image => image.id === targetId);
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrdered(next);
    setDraggedId(null);
    startTransition(async () => { await reorderProductImages(productId, next.map(image => image.id)); });
  };
  return <div className="catalog-gallery-manager" aria-label="Galleria prodotto" aria-busy={pending}>
    {ordered.map((image, index) => <div key={image.id} className="catalog-gallery-item" draggable onDragStart={() => setDraggedId(image.id)} onDragOver={event => event.preventDefault()} onDrop={() => dropOn(image.id)}>
      <Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text} width={100} height={72} />
      <small>{index === 0 ? "Copertina" : `Immagine ${index + 1}`} · trascina per ordinare</small>
      <div><form action={moveProductImage}><input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={image.id} /><button type="submit" name="direction" value="-1" disabled={index === 0} aria-label="Sposta immagine prima">↑</button><button type="submit" name="direction" value="1" disabled={index === ordered.length - 1} aria-label="Sposta immagine dopo">↓</button></form>{index > 0 && <form action={setProductCover}><input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={image.id} /><button type="submit">Usa come copertina</button></form>}<form action={removeProductImage}><input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={image.id} /><button type="submit">Rimuovi</button></form></div>
    </div>)}
  </div>;
}