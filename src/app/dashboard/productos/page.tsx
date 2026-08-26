import { Search } from "lucide-react";
import type { Metadata } from "next";
import { getProductsAdmin } from "@/lib/data/admin";
import { isSupabaseConfigured } from "@/lib/config";
import ProductsManager from "@/components/dashboard/ProductsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Productos" };

export default async function ProductosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw = "" } = await searchParams;
  const q = qRaw.toLowerCase();
  let products = await getProductsAdmin();
  if (q) {
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q)
    );
  }
  const configured = isSupabaseConfigured();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Productos</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {products.length} producto{products.length !== 1 ? "s" : ""}. Controla la{" "}
        <b>visibilidad</b> en el catálogo (ojito), marca <b>destacados</b> (para el
        inicio) y pon un <b>precio de oferta</b>.
      </p>

      <form action="/dashboard/productos" method="get" className="mt-6 max-w-sm">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            name="q"
            defaultValue={qRaw}
            placeholder="Buscar por nombre o SKU..."
            className="input pl-9"
          />
        </div>
      </form>

      <ProductsManager products={products} configured={configured} />
    </div>
  );
}
