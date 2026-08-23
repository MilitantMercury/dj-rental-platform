import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const storagePath = path.join("/");
  if (!/^(categories|products|services)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$/.test(storagePath)) {
    return new NextResponse(null, { status: 404 });
  }
  const supabase = await createClient();
  const { data } = supabase.storage.from("catalog").getPublicUrl(storagePath);
  const upstream = await fetch(data.publicUrl, { cache: "force-cache" });
  const contentType = upstream.headers.get("content-type");

  if (!upstream.ok || !upstream.body || !contentType?.startsWith("image/")) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType,
    },
  });
}
