import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// Lee un ajuste del sitio (tabla settings). Devuelve fallback si no existe.
export async function getSetting(key: string, fallback = ""): Promise<string> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return (data?.value as string) ?? fallback;
  } catch {
    return fallback;
  }
}

// ¿Está habilitado el despacho a domicilio? (por defecto sí)
export async function getDeliveryEnabled(): Promise<boolean> {
  return (await getSetting("despacho_enabled", "true")) !== "false";
}
