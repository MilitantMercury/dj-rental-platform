import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Noleggio DJ | Attrezzatura e servizi per eventi",
  description:
    "Richiedi una proposta su misura per attrezzatura DJ e servizi professionali.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: staff } = user ? await supabase.from("staff_profiles").select("role, display_name").eq("user_id", user.id).maybeSingle() : { data: null };
  const metadataName = typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : undefined;
  const role = staff?.role === "owner" ? "Owner" : staff?.role === "collaborator" ? "Collaboratore" : user ? "Cliente" : undefined;
  return (
    <html lang="it" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col"><SiteHeader userName={staff?.display_name ?? metadataName ?? user?.email ?? undefined} role={role} />{children}</body>
    </html>
  );
}
