"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductImage } from "@/types/database";
import ProductThumb from "./ProductThumb";

export default function ProductGallery({
  product,
  images,
}: {
  product: Product;
  images: ProductImage[];
}) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="card overflow-hidden">
        <ProductThumb product={product} className="aspect-square w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="relative aspect-square w-full bg-white">
          <Image
            src={images[active].url}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-contain"
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-500" : "border-brand-100 hover:border-brand-300"
              }`}
              aria-label={`Imagen ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
