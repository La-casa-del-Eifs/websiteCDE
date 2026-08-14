import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { HeroSlide } from "@/types/database";

function localHeroImages(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "hero");
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/hero/${f}`);
  } catch {
    return [];
  }
}

// URLs para el carrusel público. Usa Supabase si hay imágenes; si no, /public/hero.
export async function getHeroImages(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("hero_slides")
        .select("url")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) return data.map((d) => d.url as string);
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
