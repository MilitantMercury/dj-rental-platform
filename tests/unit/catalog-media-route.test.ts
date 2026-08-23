import { afterEach, describe, expect, it, vi } from "vitest";

const publicUrl = "https://example.supabase.co/storage/v1/object/public/catalog/categories/10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000002.webp";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    storage: {
      from: () => ({ getPublicUrl: () => ({ data: { publicUrl } }) }),
    },
  })),
}));

import { GET } from "@/app/catalog-media/[...path]/route";

describe("route media catalogo", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("inoltra i byte dell'immagine invece di rispondere con un redirect", async () => {
    const image = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    const fetchMock = vi.fn(async () => new Response(image, { headers: { "Content-Type": "image/webp" } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/catalog-media/test") as never, {
      params: Promise.resolve({
        path: ["categories", "10000000-0000-0000-0000-000000000001", "20000000-0000-0000-0000-000000000002.webp"],
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("location")).toBeNull();
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(image);
    expect(fetchMock).toHaveBeenCalledWith(publicUrl, { cache: "force-cache" });
  });

  it("rifiuta percorsi non ammessi senza contattare lo storage", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/catalog-media/test") as never, {
      params: Promise.resolve({ path: ["private", "secret.txt"] }),
    });

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
