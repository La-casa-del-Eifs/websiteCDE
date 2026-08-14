import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getHeroSlides } from "@/lib/hero";
import { isSupabaseConfigured } from "@/lib/config";
import HeroManager from "@/components/dashboard/HeroManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Portada" };

export default async function PortadaPage() {
  const slides = await getHeroSlides();
  const configured = isSupabaseConfigured();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Portada (carrusel del inicio)</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Administra las imágenes que se muestran en el hero de la página de inicio.
      </p>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Las imágenes se guardan en Supabase Storage. Si no hay ninguna, el
          carrusel usa las imágenes de respaldo de <code className="rounded bg-white px-1">public/hero</code>.
        </p>
      </div>

      <HeroManager initial={slides} configured={configured} />
    </div>
  );
}
