import Link from "next/link";
import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import CatalogGrid from "@/components/CatalogGrid";
import { getCategories, getProducts } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo de productos EIFS: molduras, cornisas, marcos, adhesivos, mallas, acabados y paneles EPS.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria = "", q = "" } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria || undefined }),
  ]);

  const linkCls = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? "bg-brand-600 text-white" : "bg-white text-ink-soft hover:bg-brand-50"
    }`;

  return (
    <PublicShell>
      <section className="border-b border-brand-100 bg-white">
        <div className="container-page py-10">
          <h1 className="text-3xl font-bold text-ink">Catálogo de productos</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Todo lo que necesitas para tu sistema EIFS. Filtra por categoría o busca
            por nombre o SKU (se filtra mientras escribes).
          </p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Categorías
          </h2>
          <nav className="flex flex-wrap gap-2 lg:flex-col">
            <Link href="/catalogo" className={linkCls(!categoria)}>
              Todas
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/catalogo?categoria=${c.slug}`} className={linkCls(categoria === c.slug)}>
                {c.name}
              </Link>
            ))}
          </nav>
        </aside>

        <CatalogGrid
          products={products}
          initialQuery={q}
          categoryName={categories.find((c) => c.slug === categoria)?.name}
        />
      </section>
    </PublicShell>
  );
}
