"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Layers } from "lucide-react";

export default function HeroCarousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  // Sin imágenes: marcador de posición con la marca.
  if (images.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="relative flex aspect-[5/4] items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-gold-50">
          <div className="relative flex flex-col items-center gap-3 text-brand-700">
            <Layers size={64} strokeWidth={1.2} />
            <p className="text-sm font-semibold uppercase tracking-widest">
              Sistema de fachada EIFS
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[5/4] w-full bg-brand-50">
        {images.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={idx === 0}
            className={`object-cover transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Ir a la imagen ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-white" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
