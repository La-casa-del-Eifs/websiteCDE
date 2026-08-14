import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { hasBsale } from "@/lib/bsale/client";

async function isStaff(): Promise<boolean> {
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
    return data?.role === "admin" || data?.role === "vendedor";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }
  if (!hasServiceRole()) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const { orderId, action } = body ?? {};
  if (!orderId || !action) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "status") {
    const value = String(body?.value || "");
    const allowed = ["pendiente", "confirmado", "en_proceso", "entregado", "cancelado"];
    if (!allowed.includes(value)) {
      return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
    }
    await supabase.from("orders").update({ status: value }).eq("id", orderId);
    return NextResponse.json({ ok: true, status: value });
  }

  if (action === "cancel") {
    await supabase
      .from("orders")
      .update({ status: "cancelado", payment_status: "anulado" })
      .eq("id", orderId);
    return NextResponse.json({ ok: true, payment_status: "anulado", status: "cancelado" });
  }

  if (action === "pay") {
    await supabase
      .from("orders")
      .update({ status: "confirmado", payment_status: "pagado" })
      .eq("id", orderId);
  }

  if (action === "pay" || action === "emit") {
    if (hasBsale()) {
      try {
        const { emitDocumentForOrder } = await import("@/lib/bsale/billing");
        await emitDocumentForOrder(orderId);
      } catch {
        /* best-effort: el error queda en bsale_error */
      }
    }
    return NextResponse.json({ ok: true, payment_status: "pagado", status: "confirmado" });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
