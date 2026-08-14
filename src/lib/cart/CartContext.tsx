"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cde_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // Persistir cambios.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  const setQty = useCallback(
    (id: string, qty: number) =>
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
      ),
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items, count, subtotal, hydrated, add, remove, setQty, clear };
  }, [items, hydrated, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
