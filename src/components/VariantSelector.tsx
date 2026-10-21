import Link from "next/link";
import type { ProductVariant } from "@/types/database";
import { effectivePrice } from "@/lib/price";
import { formatCurrency } from "@/lib/format";

// Opciones de un producto con variantes. Cada opción es su propia URL,
// así el precio, stock y botón de carrito corresponden a la elegida.
export default function VariantSelector({
  variants,
  currentId,
}: {
  variants: ProductVariant[];
  currentId: string;
}) {
  const prices = variants.map((v) => effectivePrice(v));
  const showPrices = prices.some((p) => p !== prices[0]);
  const current = variants.find((v) => v.id === currentId);

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-ink">
        Elige una opción
        {current && <span className="font-normal text-ink-soft">: {current.label}</span>}
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Opciones del producto">
        {variants.map((v, i) => {
          const active = v.id === currentId;
          const soldOut = v.stock <= 0;
          return (
            <Link
              key={v.id}
              href={`/catalogo/${v.slug}`}
              replace
              scroll={false}
              role="radio"
              aria-checked={active}
              className={`flex flex-col rounded-lg border px-3.5 py-2 text-left text-sm transition ${
                active
                  ? "border-brand-900 bg-brand-900 text-white"
                  : "border-brand-200 bg-white text-ink hover:border-brand-500"
              } ${soldOut && !active ? "opacity-60" : ""}`}
            >
              <span className={`font-medium ${soldOut ? "line-through" : ""}`}>{v.label}</span>
              {(showPrices || soldOut) && (
                <span className={`text-xs ${active ? "text-brand-100" : "text-ink-muted"}`}>
                  {soldOut ? "Agotado" : formatCurrency(prices[i])}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
