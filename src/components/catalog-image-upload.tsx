import { uploadCatalogImage } from "@/app/area-riservata/catalogo/media-actions";
import { MAX_PRODUCT_GALLERY_IMAGES } from "@/lib/catalog-media";
import type { CatalogMediaKind } from "@/lib/catalog-media";

export function CatalogImageUpload({ kind, entityId, label, hasImage = false, initialAlt = "" }: { kind: CatalogMediaKind; entityId: string; label: string; hasImage?: boolean; initialAlt?: string }) {
  const altHelpId = `catalog-alt-help-${entityId}`;
  const multipleImages = kind === "products";
  return <form action={uploadCatalogImage} className="catalog-image-form">
    <input type="hidden" name="kind" value={kind} />
    <input type="hidden" name="entityId" value={entityId} />
    <label><span>{multipleImages ? "Aggiungi un’immagine alla galleria" : hasImage ? "Sostituisci immagine" : `Immagine di ${label}`}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><small>JPEG, PNG, WebP o AVIF · massimo 5 MB · almeno 800 px sul lato corto e 1200 px sul lato lungo{multipleImages ? ` · massimo ${MAX_PRODUCT_GALLERY_IMAGES} immagini` : ""}</small></label>
    <label><span>Descrizione dell’immagine (testo alternativo)</span><input name="altText" maxLength={250} defaultValue={initialAlt || label} aria-describedby={altHelpId} /><small id={altHelpId}>Descrive l’immagine per chi usa lettori vocali e compare se il file non si carica. Puoi modificarla, ad esempio: “{label} vista frontale”.</small></label>
    <button type="submit">{multipleImages ? "Aggiungi alla galleria" : hasImage ? "Salva nuova immagine" : "Carica immagine"}</button>
  </form>;
}
