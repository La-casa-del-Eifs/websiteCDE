import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { HeroSlide, HeroImage } from "@/types/database";

function localHeroImages(): HeroImage[] {
  try {
    const dir = path.join(process.cwd(), "public", "hero");
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => ({ url: `/hero/${f}`, link: null, overlayUrl: null, overlayText: null }));
  } catch {
    return [];
  }
}

// Imágenes del carrusel público (con enlace, imagen de producto y texto de promo).
export async function getHeroImages(): Promise<HeroImage[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // Selecciona todas las columnas: así no falla si aún no se corrieron las
      // migraciones de overlay (las columnas faltantes quedan en null).
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) console.error("[hero] getHeroImages error:", error.message);
      console.log(
        `[hero] Supabase devolvió ${data?.length ?? 0} banner(s) activos` +
          (data && data.length > 0 ? "" : " → usando respaldo local public/hero")
      );
      if (data && data.length > 0)
        return data.map((d: any) => ({
          url: d.url as string,
          link: (d.link_url as string) || null,
          overlayUrl: (d.overlay_url as string) || null,
          overlayText: (d.overlay_text as string) || null,
        }));
    } catch {
      /* fallback local */
    }
  }
  return localHeroImages();
}

// Lista completa (para el panel de administración).
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data as HeroSlide[]) ?? [];
  } catch {
    return [];
  }
}
