import { createClient } from "@supabase/supabase-js";

// Cliente con service role (SOLO servidor). Se salta RLS: úsalo solo en
// rutas de servidor para crear/actualizar pedidos (incluye compras de invitado).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function hasServiceRole(): boolean {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(k && k.length > 20);
}
