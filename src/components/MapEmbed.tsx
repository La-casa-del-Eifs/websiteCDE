"use client";

import { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import DiamondPattern from "./DiamondPattern";
import { SITE } from "@/lib/config";
import { readConsent, CONSENT_EVENT, type ConsentValue } from "@/lib/consent";

// Panel con la dirección + mapa de Google al costado. Como Google Maps usa sus
// propias cookies, el mapa solo se carga si el visitante aceptó todas las
// cookies o pulsa "Mostrar mapa".
export default function MapEmbed({
  className = "",
  mapClassName = "h-[320px] md:h-[400px]",
}: {
  className?: string;
  mapClassName?: string;
}) {
  const [load, setLoad] = useState(false);
  const { lat, lng, label, url } = SITE.map;

  useEffect(() => {
    if (readConsent() === "all") setLoad(true);
    const onChange = (e: Event) => {
      if ((e as CustomEvent<ConsentValue>).detail === "all") setLoad(true);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return (
    <div
      className={`grid overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] ${className}`}
    >
      {/* Dirección + botón */}
      <div className="relative flex flex-col justify-center bg-brand-900 p-6 sm:p-8">
        <DiamondPattern id="map-diamonds" size={32} className="absolute inset-0 h-full w-full text-white/[0.07]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-brand-900">
          <MapPin size={24} />
        </span>
        <p className="relative mt-4 text-xs font-semibold uppercase tracking-wide text-gold-400">
          Nuestra ubicación
        </p>
        <p className="relative mt-1 text-lg font-semibold text-white">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent relative mt-6 self-start"
        >
          Abrir en Google Maps <ExternalLink size={15} />
        </a>
      </div>

      {/* Mapa */}
      <div className={`relative bg-brand-50 ${mapClassName}`}>
        {load ? (
          <iframe
            title={`Mapa: ${label}`}
            src={`https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <DiamondPattern id="map-placeholder-diamonds" size={32} className="absolute inset-0 h-full w-full text-brand-900/[0.06]" />
            <p className="relative max-w-xs text-sm text-ink-soft">
              El mapa lo entrega Google Maps, que usa sus propias cookies.
            </p>
            <button type="button" onClick={() => setLoad(true)} className="btn-primary relative mt-4 px-4 py-2">
              <MapPin size={16} /> Mostrar mapa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
