"use client";

import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import type { Product } from "@/types/database";
import { effectivePrice } from "@/lib/price";

export default function AddToCartButton({
  product,
  variant = "card",
}: {
  product: Product;
  variant?: "card" | "detail";
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const doAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: effectivePrice(product),
        sku: product.sku,
      },
      variant === "detail" ? qty : 1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const outOfStock = product.stock <= 0;

  if (variant === "detail") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-brand-200">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2.5 text-ink-soft hover:text-brand-700"
            aria-label="Menos"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-ink">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2.5 text-ink-soft hover:text-brand-700"
            aria-label="Más"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={doAdd}
          disabled={outOfStock}
          className="btn-accent"
        >
          {added ? <Check size={17} /> : <ShoppingCart size={17} />}
          {added ? "Agregado" : outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={doAdd}
      disabled={outOfStock}
      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
      aria-label={`Agregar ${product.name} al carrito`}
    >
      {added ? <Check size={15} /> : <ShoppingCart size={15} />}
      {added ? "Agregado" : "Agregar"}
    </button>
  );
}
