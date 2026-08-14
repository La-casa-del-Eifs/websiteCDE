import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// Devuelve la URL de una imagen de sección administrable, o null si no hay.
export async function getSiteImage(key: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_images")
      .select("url")
      .eq("key", key)
      .maybeSingle();
    return (data?.url as string) ?? null;
  } catch {
    return null;
  }
}
