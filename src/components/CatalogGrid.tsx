"use client";

import { useMemo, useState } from "react";
import { Search, PackageX } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/database";

export default function CatalogGrid({
  products,
  initialQuery = "",
  categoryName,
}: {
  products: Product[];
  initialQuery?: string;
  categoryName?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const term = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
    );
  }, [products, term]);

  return (
    <div>
      <div className="relative mb-4 max-w-md">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto o SKU..."
          className="input pl-9"
        />
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        {categoryName ? ` en ${categoryName}` : ""}
        {term ? ` para “${q}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <PackageX size={40} className="text-ink-muted" />
          <p className="font-medium text-ink">Sin resultados</p>
          <p className="text-sm text-ink-soft">Prueba con otro término o categoría.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
