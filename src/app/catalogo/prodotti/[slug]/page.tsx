import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const supabase = await createServerSupabaseClient(); const { data } = await supabase.from("products").select("name,description,included_accessories").eq("slug", slug).eq("active", true).maybeSingle(); if (!data) notFound(); return <main className="catalog-page shell"><Link href="/catalogo">← Catalogo</Link><article className="catalog-detail"><p className="eyebrow dark">Attrezzatura</p><h1>{data.name}</h1><p>{data.description || "Soluzione professionale configurabile per il tuo evento."}</p>{data.included_accessories && <><h2>Accessori inclusi</h2><p>{data.included_accessories}</p></>}<Link className="cta" href="/registrazione">Richiedi una proposta</Link></article></main>; }
