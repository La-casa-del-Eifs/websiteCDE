import Link from "next/link";
import type { Product } from "@/types/database";
import { formatCurrency } from "@/lib/format";
import ProductThumb from "./ProductThumb";
import AddToCartButton from "./AddToCartButton";
import { hasOffer, effectivePrice } from "@/lib/price";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      {hasOffer(product) && !outOfStock && (
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
          {product.dimensions && (
            <p className="mt-1 text-xs text-ink-muted">{product.dimensions}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <div className="min-w-0">
          {hasOffer(product) ? (
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
        <AddToCartButton product={product} variant="card" />
      </div>
    </div>
  );
}
