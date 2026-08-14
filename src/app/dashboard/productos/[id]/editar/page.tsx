import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getProductForEditor } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/config";
import ProductExtrasEditor from "@/components/dashboard/ProductExtrasEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Editar producto" };

export default async function ProductoEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const configured = isSupabaseConfigured();
  const product = await getProductForEditor(id);
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
        Editar {product ? `· ${product.name}` : ""}
      </h1>
      {product?.sku && <p className="text-sm text-ink-muted">{product.sku}</p>}

      <ProductExtrasEditor
        productId={id}
        initial={{
          leyenda: product?.leyenda ?? "",
          description: product?.description ?? "",
          datasheet_url: product?.datasheet_url ?? null,
          datasheet_path: product?.datasheet_path ?? null,
        }}
        configured={configured}
      />
    </div>
  );
}
