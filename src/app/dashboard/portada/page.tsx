import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getHeroSlides } from "@/lib/hero";
import { getSiteImage } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/config";
import HeroManager from "@/components/dashboard/HeroManager";
import SiteImageManager from "@/components/dashboard/SiteImageManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Portada" };

export default async function PortadaPage() {
  const slides = await getHeroSlides();
  const eifsImage = await getSiteImage("eifs_diagram");
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
          carrusel usa las imágenes de respaldo de{" "}
          <code className="rounded bg-white px-1">public/hero</code>.
        </p>
      </div>

      <HeroManager initial={slides} configured={configured} />

      <hr className="my-10 border-brand-100" />

      <h2 className="text-xl font-bold text-ink">
        Imagen de la sección “¿Qué es EIFS?”
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Se muestra en la página <b>Nosotros</b>. Si no subes ninguna, se usa el
        diseño de respaldo con el ícono de capas.
      </p>
      <SiteImageManager
        imageKey="eifs_diagram"
        currentUrl={eifsImage}
        configured={configured}
        hint="Recomendado ~1200×960 px (proporción 5:4)."
      />
    </div>
  );
}
