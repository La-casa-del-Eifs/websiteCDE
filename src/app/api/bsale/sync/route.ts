import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { hasBsale } from "@/lib/bsale/client";
import { hasServiceRole } from "@/lib/supabase/admin";
import { syncProductsAndStock } from "@/lib/bsale/sync";

async function isAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return data?.role === "admin";
  } catch {
    return false;
  }
}

// Puede tardar varios minutos con catálogos grandes.
export const maxDuration = 300;

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  }
  if (!hasBsale()) {
    return NextResponse.json({ error: "Falta BSALE_ACCESS_TOKEN en .env.local." }, { status: 500 });
  }
  if (!isSupabaseConfigured() || !hasServiceRole()) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local." },
      { status: 500 }
    );
  }
  try {
    const summary = await syncProductsAndStock();
    return NextResponse.json({ ok: true, summary });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error en la sincronización." },
      { status: 502 }
    );
  }
}
