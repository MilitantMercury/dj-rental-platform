import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const supabase = await createServerSupabaseClient(); const { data } = await supabase.from("services").select("name,description,conditions").eq("slug", slug).eq("active", true).maybeSingle(); if (!data) notFound(); return <main className="catalog-page shell"><Link href="/catalogo">← Catalogo</Link><article className="catalog-detail"><p className="eyebrow dark">Servizio</p><h1>{data.name}</h1><p>{data.description || "Supporto professionale definito insieme al gestore."}</p>{data.conditions && <><h2>Condizioni</h2><p>{data.conditions}</p></>}<Link className="cta" href="/registrazione">Richiedi una proposta</Link></article></main>; }
