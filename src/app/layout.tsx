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
  const [staffResult, profileResult, customerResult] = user
    ? await Promise.all([
        supabase.from("staff_profiles").select("role,display_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("customer_profiles").select("customer_type,company_name").eq("user_id", user.id).maybeSingle(),
      ])
    : [{ data: null }, { data: null }, { data: null }];
  const staff = staffResult.data;
  const profile = profileResult.data;
  const customer = customerResult.data;
  const customerName = customer?.customer_type === "business"
    ? customer.company_name
    : profile?.first_name;
  const role = staff?.role === "owner" ? "Owner" : staff?.role === "collaborator" ? "Collaboratore" : user ? "Cliente" : undefined;
  return (
    <html lang="it" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col"><SiteHeader userName={staff?.display_name ?? customerName ?? user?.email ?? undefined} role={role} />{children}</body>
    </html>
  );
}
