const MAX_CATALOG_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_CATALOG_IMAGE_EDGE = 1920;
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

export async function hasValidCatalogImageSignature(file: File, extension: string) {
  if (!["jpg", "png", "webp", "avif"].includes(extension)) return false;

  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(Buffer.from(await file.arrayBuffer()), {
      failOn: "error",
      limitInputPixels: 40_000_000,
    }).metadata();
    const supportedFormat = ["jpeg", "png", "webp"].includes(metadata.format ?? "")
      || (metadata.format === "heif" && metadata.compression === "av1");
    return supportedFormat && Boolean(metadata.width && metadata.height);
  } catch {
    return false;
  }
}

export async function optimizeCatalogImage(file: File) {
  const sharp = (await import("sharp")).default;
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error("Immagine non decodificabile.");
  return image
    .rotate()
    .resize({ width: MAX_CATALOG_IMAGE_EDGE, height: MAX_CATALOG_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}
export function catalogImagePath(kind: CatalogMediaKind, entityId: string, extension: string, imageId = crypto.randomUUID()) {
  return `${kind}/${entityId}/${imageId}.${extension}`;
}

export function catalogMediaUrl(path: string | null | undefined) {
  return path ? `/catalog-media/${path.split("/").map(encodeURIComponent).join("/")}` : null;
}
