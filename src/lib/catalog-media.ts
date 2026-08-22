const MAX_CATALOG_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type CatalogMediaKind = "categories" | "products" | "services";

export function validateCatalogImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return { file: null, error: null } as const;
  const extension = EXTENSIONS[value.type];
  if (!extension) return { file: null, error: "Formato immagine non supportato." } as const;
  if (value.size > MAX_CATALOG_IMAGE_BYTES) return { file: null, error: "L’immagine supera il limite di 5 MB." } as const;
  return { file: value, extension, error: null } as const;
}

export function catalogImagePath(kind: CatalogMediaKind, entityId: string, extension: string, imageId = crypto.randomUUID()) {
  return `${kind}/${entityId}/${imageId}.${extension}`;
}

export function catalogMediaUrl(path: string | null | undefined) {
  return path ? `/catalog-media/${path.split("/").map(encodeURIComponent).join("/")}` : null;
}
