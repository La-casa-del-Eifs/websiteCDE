import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { bsaleGet, hasBsale } from "@/lib/bsale/client";

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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  }
  if (!hasBsale()) {
    return NextResponse.json(
      { error: "Falta BSALE_ACCESS_TOKEN en .env.local." },
      { status: 500 }
    );
  }
  try {
    const [products, clients, docTypes, priceLists, offices] = await Promise.all([
      bsaleGet("products.json?limit=2&expand=[variants]"),
      bsaleGet("clients.json?limit=1"),
      bsaleGet("document_types.json?limit=20"),
      bsaleGet("price_lists.json?limit=15"),
      bsaleGet("offices.json?limit=20"),
    ]);
    return NextResponse.json({
      ok: true,
      counts: {
        products: products?.count ?? 0,
        clients: clients?.count ?? 0,
        documentTypes: docTypes?.count ?? 0,
        priceLists: priceLists?.count ?? 0,
      },
      sampleProduct: products?.items?.[0] ?? null,
      sampleClient: clients?.items?.[0] ?? null,
      documentTypes: (docTypes?.items ?? []).map((d: any) => ({ id: d.id, name: d.name, codeSii: d.codeSii })),
      priceLists: (priceLists?.items ?? []).map((p: any) => ({ id: p.id, name: p.name })),
      offices: (offices?.items ?? []).map((o: any) => ({ id: o.id, name: o.name })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error llamando a Bsale" },
      { status: 502 }
    );
  }
}
