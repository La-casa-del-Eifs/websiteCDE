"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

// Estado de sesión reactivo para el navbar (y donde se necesite en cliente).
export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
