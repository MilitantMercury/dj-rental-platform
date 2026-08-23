"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartSummary } from "@/components/cart-summary";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; name: string; type: string; quantity: number; rowId: string };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: cart } = await supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle();
    if (!cart) return;
    const { data } = await supabase.from("cart_items").select("id,item_type,quantity,product_id,service_id").eq("cart_id", cart.id);
    const ids = (data ?? []).map(item => item.product_id ?? item.service_id).filter((id): id is string => Boolean(id));
    const [{ data: products }, { data: services }] = await Promise.all([
      supabase.from("products").select("id,name").in("id", ids),
      supabase.from("services").select("id,name").in("id", ids),
    ]);
    const names = new Map([...(products ?? []), ...(services ?? [])].map(item => [item.id, item.name]));
    setItems((data ?? []).map(item => ({ rowId: item.id, id: item.product_id ?? item.service_id ?? "", name: names.get(item.product_id ?? item.service_id ?? "") ?? "Elemento catalogo", type: item.item_type, quantity: item.quantity })));
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const change = async (item: Item, delta: number) => {
    const supabase = createClient();
    const next = item.quantity + delta;
    if (next <= 0) await supabase.from("cart_items").delete().eq("id", item.rowId);
    else await supabase.from("cart_items").update({ quantity: next }).eq("id", item.rowId);
    await load();
    window.dispatchEvent(new Event("cart-updated"));
  };

  const remove = async (item: Item) => {
    await createClient().from("cart_items").delete().eq("id", item.rowId);
    await load();
    window.dispatchEvent(new Event("cart-updated"));
  };

  const products = items.filter(item => item.type === "product").reduce((sum, item) => sum + item.quantity, 0);
  const services = items.filter(item => item.type === "service").reduce((sum, item) => sum + item.quantity, 0);

  return <main className="cart-page shell">
    <Link href="/catalogo">← Continua a esplorare</Link><p className="eyebrow dark">Il tuo carrello</p><h1>La tua selezione.</h1>
    {items.length ? <div className="cart-layout"><div className="cart-list">{items.map(item => <article className="cart-item" key={item.rowId}><div><small>{item.type}</small><h2>{item.name}</h2><div className="quantity-control"><button onClick={() => void change(item, -1)} type="button" aria-label={`Riduci quantità di ${item.name}`}>−</button><strong aria-label={`Quantità ${item.quantity}`}>{item.quantity}</strong><button onClick={() => void change(item, 1)} type="button" aria-label={`Aumenta quantità di ${item.name}`}>+</button></div></div><button className="cart-remove" onClick={() => void remove(item)} type="button">Rimuovi</button></article>)}</div><CartSummary items={items} products={products} services={services} /></div> : <div className="cart-empty"><h2>Il carrello è vuoto.</h2><Link className="cta" href="/catalogo">Vai al catalogo</Link></div>}
  </main>;
}
