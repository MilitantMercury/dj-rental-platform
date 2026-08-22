import { uploadCatalogImage } from "@/app/area-riservata/catalogo/media-actions";
import type { CatalogMediaKind } from "@/lib/catalog-media";

export function CatalogImageUpload({ kind, entityId, label }: { kind: CatalogMediaKind; entityId: string; label: string }) {
  return <form action={uploadCatalogImage} className="catalog-image-form">
    <input type="hidden" name="kind" value={kind} />
    <input type="hidden" name="entityId" value={entityId} />
    <label><span>Immagine di {label}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
    <label><span>Testo alternativo</span><input name="altText" maxLength={250} placeholder={`Descrivi ${label}`} /></label>
    <button type="submit">Carica immagine</button>
  </form>;
}
