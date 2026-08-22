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
  return NextResponse.redirect(data.publicUrl, { status: 307, headers: { "Cache-Control": "public, max-age=3600" } });
}
