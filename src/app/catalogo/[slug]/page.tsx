import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  FileText,
  ArrowLeft,
  Check,
  MessageCircle,
  Ruler,
  Barcode,
  Package,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getProducts, getProductImages } from "@/lib/data/catalog";
import { hasOffer, effectivePrice } from "@/lib/price";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = await getProductImages(product.id);

  const related = (
    await getProducts({ categorySlug: product.category?.slug })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const inStock = product.stock > 0;

  return (
    <PublicShell>
      <div className="container-page py-8">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Imagen / galería */}
          <ProductGallery product={product} images={images} />

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/catalogo?categoria=${product.category.slug}`}
                className="badge w-fit hover:bg-brand-200"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-bold text-ink">{product.name}</h1>
            {product.leyenda && (
              <p className="mt-2 text-base text-ink-soft">{product.leyenda}</p>
            )}
            {hasOffer(product) ? (
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <p className="text-3xl font-bold text-brand-700">{formatCurrency(effectivePrice(product))}</p>
                <p className="text-lg text-ink-muted line-through">{formatCurrency(product.price)}</p>
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold uppercase text-white">Oferta</span>
              </div>
            ) : (
              <p className="mt-4 text-3xl font-bold text-brand-700">{formatCurrency(product.price)}</p>
            )}

            <p
              className={`mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium ${
                inStock ? "text-green-700" : "text-red-600"
              }`}
            >
              {inStock && <Check size={15} />}
              {inStock ? "Disponible" : "Temporalmente agotado"}
            </p>

            {product.description && (
              <p className="mt-6 leading-relaxed text-ink-soft">
                {product.description}
              </p>
            )}

            {product.datasheet_url && (
              <a
                href={product.datasheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-6 w-fit"
              >
                <FileText size={16} /> Cartilla técnica (PDF)
              </a>
            )}

            {/* Especificaciones */}
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.dimensions && (
                <div className="card flex items-center gap-3 p-4">
                  <Ruler size={18} className="text-brand-500" />
                  <div>
                    <dt className="text-xs text-ink-muted">Medidas</dt>
                    <dd className="text-sm font-medium text-ink">
                      {product.dimensions}
                    </dd>
                  </div>
                </div>
              )}
              {product.sku && (
                <div className="card flex items-center gap-3 p-4">
                  <Barcode size={18} className="text-brand-500" />
                  <div>
                    <dt className="text-xs text-ink-muted">Código (SKU)</dt>
                    <dd className="text-sm font-medium text-ink">
                      {product.sku}
                    </dd>
                  </div>
                </div>
              )}
              <div className="card flex items-center gap-3 p-4">
                <Package size={18} className="text-brand-500" />
                <div>
                  <dt className="text-xs text-ink-muted">Stock</dt>
                  <dd className="text-sm font-medium text-ink">
                    {product.stock} unidades
                  </dd>
                </div>
              </div>
            </dl>

            {/* Acciones */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/contacto?producto=${encodeURIComponent(product.name)}`}
                className="btn-primary"
              >
                <MessageCircle size={17} /> Solicitar cotización
              </Link>
              <AddToCartButton product={product} variant="detail" />
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-ink">Productos relacionados</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
