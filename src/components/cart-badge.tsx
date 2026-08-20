"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CartBadge() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCount(0);
        return;
      }

      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("customer_user_id", user.id)
        .maybeSingle();

      if (!cart) {
        setCount(0);
        return;
      }

      const { data } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("cart_id", cart.id);

      setCount((data ?? []).reduce((sum, item) => sum + item.quantity, 0));
    };

    void load();
    addEventListener("cart-updated", load);

    return () => removeEventListener("cart-updated", load);
  }, [pathname]);

  return <span>{count}</span>;
}
