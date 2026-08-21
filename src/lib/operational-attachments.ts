export const OPERATIONAL_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const OPERATIONAL_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export function isAllowedOperationalAttachment(mimeType: string, sizeBytes: number) {
  return OPERATIONAL_ATTACHMENT_MIME_TYPES.includes(mimeType as (typeof OPERATIONAL_ATTACHMENT_MIME_TYPES)[number]) && sizeBytes > 0 && sizeBytes <= OPERATIONAL_ATTACHMENT_MAX_BYTES;
}
