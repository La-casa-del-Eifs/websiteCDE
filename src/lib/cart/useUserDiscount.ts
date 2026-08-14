"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

// Devuelve el % de descuento del usuario logueado (rol empresa). 0 si no aplica.
export function useUserDiscount() {
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("role, discount_percent")
          .eq("id", user.id)
          .single();
        if (active && data && data.role === "empresa") {
          setDiscount(Number(data.discount_percent) || 0);
        }
      } catch {
        /* noop */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return discount;
}
