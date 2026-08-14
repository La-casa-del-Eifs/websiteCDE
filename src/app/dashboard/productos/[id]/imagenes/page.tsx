import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getProductBasic, getProductImages } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/config";
import ProductImagesManager from "@/components/dashboard/ProductImagesManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Imágenes de producto" };

export default async function ProductoImagenesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const configured = isSupabaseConfigured();
  const [product, images] = await Promise.all([
    getProductBasic(id),
    getProductImages(id),
  ]);
  if (configured && !product) notFound();

  return (
    <div>
      <Link
        href="/dashboard/productos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Volver a Productos
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-ink">
        Imágenes {product ? `· ${product.name}` : ""}
      </h1>
      {product?.sku && <p className="text-sm text-ink-muted">{product.sku}</p>}

      <ProductImagesManager productId={id} initial={images} configured={configured} />
    </div>
  );
}
