import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/database";
import { formatCurrency } from "@/lib/format";
import ProductThumb from "./ProductThumb";
import AddToCartButton from "./AddToCartButton";
import { hasOffer, effectivePrice } from "@/lib/price";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  // Producto con variantes: se elige la opción en la ficha.
  const variants = product.variants && product.variants.length > 1 ? product.variants : null;
  const prices = variants?.map((v) => effectivePrice(v)) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const samePrice = prices.every((p) => p === prices[0]);
  const anyOffer = variants ? variants.some((v) => hasOffer(v)) : hasOffer(product);
  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      {anyOffer && !outOfStock && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Oferta
        </span>
      )}
      {outOfStock && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Temporalmente agotado
        </span>
      )}
      <Link href={`/catalogo/${product.slug}`} className="flex flex-1 flex-col">
        <ProductThumb
          product={product}
          className={`aspect-[4/3] w-full ${outOfStock ? "opacity-60" : ""}`}
        />
        <div className="flex flex-1 flex-col p-4">
          {product.category && (
            <span className="badge mb-2 w-fit">{product.category.name}</span>
          )}
          <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-brand-700">
            {product.name}
          </h3>
          {product.leyenda && (
            <p className="mt-1 text-xs text-ink-soft">{product.leyenda}</p>
          )}
          {product.dimensions && (
            <p className="mt-1 text-xs text-ink-muted">{product.dimensions}</p>
          )}
          {variants && (
            <p className="mt-2 text-xs font-medium text-brand-600">
              {variants.length} opciones disponibles
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <div className="min-w-0">
          {variants ? (
            <span className="text-lg font-bold text-brand-700">
              {!samePrice && <span className="mr-1 text-xs font-medium text-ink-muted">Desde</span>}
              {formatCurrency(minPrice)}
            </span>
          ) : hasOffer(product) ? (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-bold text-brand-700">
                {formatCurrency(effectivePrice(product))}
              </span>
              <span className="text-xs text-ink-muted line-through">
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-brand-700">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        {variants ? (
          <Link
            href={`/catalogo/${product.slug}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
          >
            Elegir opción <ChevronRight size={14} />
          </Link>
        ) : (
          <AddToCartButton product={product} variant="card" />
        )}
      </div>
    </div>
  );
}
