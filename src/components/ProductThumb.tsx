import Image from "next/image";
import { Layers } from "lucide-react";
import type { Product } from "@/types/database";

export default function ProductThumb({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  if (product.image_url) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-gold-50 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #0f2b53 0, #0f2b53 2px, transparent 2px, transparent 14px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-brand-700">
        <Layers size={40} strokeWidth={1.4} />
        {product.sku && (
          <span className="rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-brand-900">
            {product.sku}
          </span>
        )}
      </div>
    </div>
  );
}
