"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useUserDiscount } from "@/lib/cart/useUserDiscount";
import { formatCurrency } from "@/lib/format";

export default function CartView() {
  const { items, subtotal, setQty, remove, hydrated } = useCart();
  const discount = useUserDiscount();

  const discountAmount = Math.round((subtotal * discount) / 100);
  const total = subtotal - discountAmount;

  if (hydrated && items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-md p-10 text-center">
          <ShoppingCart size={44} className="mx-auto text-ink-muted" />
          <h1 className="mt-4 text-xl font-bold text-ink">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Explora el catálogo y agrega productos para tu proyecto.
          </p>
          <Link href="/catalogo" className="btn-primary mt-6">
            Ir al catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Tu carrito</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                {item.sku || "EIFS"}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/catalogo/${item.slug}`}
                  className="font-medium text-ink hover:text-brand-700"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {formatCurrency(item.price)} c/u
                </p>
              </div>
              <div className="flex items-center rounded-lg border border-brand-200">
                <button
                  onClick={() => setQty(item.id, item.qty - 1)}
                  className="px-2.5 py-2 text-ink-soft hover:text-brand-700"
                  aria-label="Menos"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {item.qty}
                </span>
                <button
                  onClick={() => setQty(item.id, item.qty + 1)}
                  className="px-2.5 py-2 text-ink-soft hover:text-brand-700"
                  aria-label="Más"
                >
                  <Plus size={15} />
                </button>
              </div>
              <div className="w-24 text-right font-semibold text-ink">
                {formatCurrency(item.price * item.qty)}
              </div>
              <button
                onClick={() => remove(item.id)}
                className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
                aria-label="Quitar"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← Seguir comprando
          </Link>
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-ink">Resumen</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-medium text-ink">{formatCurrency(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt className="flex items-center gap-1">
                    <Tag size={14} /> Descuento empresa ({discount}%)
                  </dt>
                  <dd className="font-medium">−{formatCurrency(discountAmount)}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-brand-100 pt-3">
                <dt className="text-base font-semibold text-ink">Total</dt>
                <dd className="text-base font-bold text-brand-700">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-ink-muted">
              El costo de despacho se calcula en el siguiente paso.
            </p>
            <Link href="/checkout" className="btn-primary mt-5 w-full">
              Continuar al pago <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
