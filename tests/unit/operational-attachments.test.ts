import { describe, expect, it } from "vitest";
import { OPERATIONAL_ATTACHMENT_MAX_BYTES, isAllowedOperationalAttachment } from "@/lib/operational-attachments";

describe("allegati operativi", () => {
  it("accetta soltanto formati e dimensioni previsti", () => {
    expect(isAllowedOperationalAttachment("image/jpeg", OPERATIONAL_ATTACHMENT_MAX_BYTES)).toBe(true);
    expect(isAllowedOperationalAttachment("application/zip", 100)).toBe(false);
    expect(isAllowedOperationalAttachment("application/pdf", OPERATIONAL_ATTACHMENT_MAX_BYTES + 1)).toBe(false);
  });
});
