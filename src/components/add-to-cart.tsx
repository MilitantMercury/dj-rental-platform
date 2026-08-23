"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ItemType = "product" | "service";

export function CartQuantityControl({ name, quantity, busy, error, onDecrease, onIncrease }: { name: string; quantity: number; busy: boolean; error: boolean; onDecrease: () => void; onIncrease: () => void }) {
  return <div className="catalog-quantity-control" aria-label={`Quantità di ${name} nel carrello`}>
    <button type="button" disabled={busy} onClick={onDecrease} aria-label={`Riduci quantità di ${name}`}>−</button>
    <output aria-live="polite" aria-label={`Quantità ${quantity}`}>{quantity}</output>
    <button type="button" disabled={busy} onClick={onIncrease} aria-label={`Aumenta quantità di ${name}`}>+</button>
    {error && <small role="alert">Riprova</small>}
  </div>;
}

export function AddToCart({ id, name, type = "product" }: { id: string; name: string; type?: ItemType }) {
  const [quantity, setQuantity] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cart } = await supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle();
      if (!cart) return;
      const column = type === "service" ? "service_id" : "product_id";
      const { data: item } = await supabase.from("cart_items").select("quantity").eq("cart_id", cart.id).eq(column, id).maybeSingle();
      if (active) setQuantity(item?.quantity ?? 0);
    };
    void load();
    return () => { active = false; };
  }, [id, type]);

  const changeQuantity = async (delta: number) => {
    if (busy) return;
    setBusy(true);
    setError(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/registrazione?next=${encodeURIComponent(window.location.pathname)}`);
      setBusy(false);
      return;
    }
    const { data: cart } = delta > 0
      ? await supabase.from("carts").upsert({ customer_user_id: user.id }, { onConflict: "customer_user_id" }).select("id").single()
      : await supabase.from("carts").select("id").eq("customer_user_id", user.id).maybeSingle();
    if (!cart) {
      setError(true);
      setBusy(false);
      return;
    }
    const column = type === "service" ? "service_id" : "product_id";
    const { data: item } = await supabase.from("cart_items").select("id,quantity").eq("cart_id", cart.id).eq(column, id).maybeSingle();
    const next = Math.max(0, (item?.quantity ?? 0) + delta);
    const result = item
      ? next === 0
        ? await supabase.from("cart_items").delete().eq("id", item.id)
        : await supabase.from("cart_items").update({ quantity: next }).eq("id", item.id)
      : type === "service"
        ? await supabase.from("cart_items").insert({ cart_id: cart.id, item_type: "service", product_id: null, service_id: id, quantity: 1 })
        : await supabase.from("cart_items").insert({ cart_id: cart.id, item_type: "product", product_id: id, service_id: null, quantity: 1 });
    if (result.error) setError(true);
    else {
      setQuantity(item ? next : 1);
      window.dispatchEvent(new Event("cart-updated"));
    }
    setBusy(false);
  };

  if (quantity === 0) return <button className="cart-button" type="button" disabled={busy} onClick={() => void changeQuantity(1)}>{error ? "Errore, riprova" : "+ Aggiungi al carrello"}</button>;

  return <CartQuantityControl name={name} quantity={quantity} busy={busy} error={error} onDecrease={() => void changeQuantity(-1)} onIncrease={() => void changeQuantity(1)} />;
}
