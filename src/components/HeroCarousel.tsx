"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Layers } from "lucide-react";
import type { HeroImage } from "@/types/database";

export default function HeroCarousel({
  images,
  variant = "card",
}: {
  images: HeroImage[];
  variant?: "card" | "background";
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  // ── Modo FONDO: imágenes a todo el ancho del hero (con texto encima) ──
  if (variant === "background") {
    if (images.length === 0) return null;
    return (
      <>
        {/* Fondo del banner (recortado a esquinas redondeadas; el producto sobresale fuera) */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {images.map((slide, idx) => (
            <div
              key={slide.url}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === i ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.url}
                alt=""
                fill
                sizes="100vw"
                priority={idx === 0}
                className="object-cover"
              />
              {slide.link && (
                <a href={slide.link} aria-label="Ver más" className="absolute inset-0" />
              )}
            </div>
          ))}
        </div>

        {/* Producto (PNG) + texto de promo, abajo a la derecha, sobresaliendo */}
        {images.map((slide, idx) =>
          slide.overlayUrl || slide.overlayText ? (
            <div
              key={`ov-${slide.url}`}
              className={`pointer-events-none absolute bottom-0 right-0 z-[18] hidden translate-x-2 translate-y-8 items-end gap-2 transition-opacity duration-700 sm:flex md:translate-x-5 md:translate-y-10 md:gap-4 ${
                idx === i ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.overlayUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.overlayUrl}
                  alt=""
                  className="h-[200px] w-auto max-w-[42%] translate-x-1 translate-y-6 object-contain drop-shadow-2xl sm:h-[260px] md:h-[320px] md:translate-x-3 md:translate-y-10"
                />
              )}
              {slide.overlayText && (
                <div className="mb-4 rounded-l-[2.5rem] rounded-r-2xl bg-gold-400 px-5 py-3 text-center shadow-2xl md:px-7 md:py-4">
                  <span className="block whitespace-pre-line text-lg font-extrabold leading-tight text-brand-900 md:text-2xl">
                    {slide.overlayText}
                  </span>
                </div>
              )}
            </div>
          ) : null
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-sm">
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
      </>
    );
  }

  // ── Modo TARJETA (por defecto) ──
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
        {images.map((slide, idx) => {
          const active = idx === i;
          return (
            <div
              key={slide.url}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={idx === 0}
                className="object-cover"
              />
              {slide.link && (
                <a
                  href={slide.link}
                  aria-label="Ver más"
                  className="absolute inset-0 z-10"
                />
              )}
            </div>
          );
        })}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
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
