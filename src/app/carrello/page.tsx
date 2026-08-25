"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartSummary } from "@/components/cart-summary";
import { buildCartViewItems, type CartViewItem } from "@/lib/cart-view";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const [items, setItems] = useState<CartViewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: cart } = await supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle();
    if (!cart) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase.from("cart_items").select("id,item_type,quantity,product_id,service_id").eq("cart_id", cart.id);
    const rows = data ?? [];
    const productIds = rows.map(item => item.product_id).filter((id): id is string => Boolean(id));
    const serviceIds = rows.map(item => item.service_id).filter((id): id is string => Boolean(id));
    const [{ data: products }, { data: services }, { data: productImages }] = await Promise.all([
      productIds.length ? supabase.from("products").select("id,name").in("id", productIds) : Promise.resolve({ data: [] }),
      serviceIds.length ? supabase.from("services").select("id,name").in("id", serviceIds) : Promise.resolve({ data: [] }),
      productIds.length ? supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").in("product_id", productIds).order("sort_order") : Promise.resolve({ data: [] }),
    ]);

    setItems(buildCartViewItems(rows, products ?? [], services ?? [], productImages ?? []));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const change = async (item: CartViewItem, delta: number) => {
    const supabase = createClient();
    const next = item.quantity + delta;
    if (next <= 0) await supabase.from("cart_items").delete().eq("id", item.rowId);
    else await supabase.from("cart_items").update({ quantity: next }).eq("id", item.rowId);
    await load();
    window.dispatchEvent(new Event("cart-updated"));
  };

  const remove = async (item: CartViewItem) => {
    await createClient().from("cart_items").delete().eq("id", item.rowId);
    await load();
    window.dispatchEvent(new Event("cart-updated"));
  };

  const products = items.filter(item => item.type === "product").reduce((sum, item) => sum + item.quantity, 0);
  const services = items.filter(item => item.type === "service").reduce((sum, item) => sum + item.quantity, 0);
  const total = products + services;

  return <main className="cart-page cart-wow-page shell">
    <div className="cart-wow-orbit" aria-hidden="true" />
    <Link href="/catalogo">← Continua a esplorare</Link>
    <header className="cart-wow-header">
      <div><p className="eyebrow">La tua selezione</p><h1>Costruiamo<br /><em>il tuo evento.</em></h1></div>
      <div className="cart-wow-counter"><strong>{String(total).padStart(2, "0")}</strong><span>{total === 1 ? "elemento scelto" : "elementi scelti"}</span></div>
    </header>
    <p className="cart-wow-intro">Regola le quantità e inviaci la selezione: verificheremo ogni dettaglio prima di preparare la proposta.</p>

    {loading ? <div className="cart-loading" role="status">Caricamento della selezione…</div> : items.length ? <div className="cart-layout">
      <div className="cart-list">{items.map((item, index) => <article className="cart-item" key={item.rowId}>
        <div className={`cart-item-media${item.imageUrl ? "" : " is-placeholder"}`}>
          {item.imageUrl ? <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="(max-width: 720px) 92px, 180px" quality={92} /> : <span aria-hidden="true">{item.type === "service" ? "✦" : item.name.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div className="cart-item-copy">
          <div className="cart-item-meta"><small>{item.type === "service" ? "Servizio" : "Attrezzatura"}</small><span>{String(index + 1).padStart(2, "0")}</span></div>
          <h2>{item.name}</h2>
          <div className="cart-item-footer">
            <div className="quantity-control" aria-label={`Quantità di ${item.name}`}>
              <button onClick={() => void change(item, -1)} type="button" aria-label={`Riduci quantità di ${item.name}`}>−</button>
              <strong aria-label={`Quantità ${item.quantity}`}>{item.quantity}</strong>
              <button onClick={() => void change(item, 1)} type="button" aria-label={`Aumenta quantità di ${item.name}`}>+</button>
            </div>
            <button className="cart-remove" onClick={() => void remove(item)} type="button">Rimuovi</button>
          </div>
        </div>
      </article>)}</div>
      <CartSummary items={items} products={products} services={services} />
    </div> : <div className="cart-empty"><div><p className="eyebrow">Pronto per iniziare?</p><h2>Il carrello è vuoto.</h2><p>Esplora attrezzature e servizi e crea la selezione giusta per il tuo evento.</p><Link className="cta" href="/catalogo">Vai al catalogo <span aria-hidden="true">→</span></Link></div></div>}
  </main>;
}
