import Image from "next/image";
import { removeProductImage, setProductCover } from "@/app/area-riservata/catalogo/gallery-actions";
import { catalogMediaUrl } from "@/lib/catalog-media";

type GalleryImage = { id: string; storage_path: string; alt_text: string; sort_order: number };

export function ProductGalleryManager({ productId, images }: { productId: string; images: GalleryImage[] }) {
  if (!images.length) return null;
  return <div className="catalog-gallery-manager" aria-label="Galleria prodotto">
    {images.map((image, index) => <div key={image.id} className="catalog-gallery-item">
      <Image src={catalogMediaUrl(image.storage_path) ?? ""} alt={image.alt_text} width={100} height={72} />
      <small>{index === 0 ? "Copertina" : `Immagine ${index + 1}`}</small>
      <div>{index > 0 && <form action={setProductCover}><input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={image.id} /><button type="submit">Usa come copertina</button></form>}<form action={removeProductImage}><input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={image.id} /><button type="submit">Rimuovi</button></form></div>
    </div>)}
  </div>;
}
