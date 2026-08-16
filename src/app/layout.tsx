import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noleggio DJ | Attrezzatura e servizi per eventi",
  description:
    "Richiedi una proposta su misura per attrezzatura DJ e servizi professionali.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
