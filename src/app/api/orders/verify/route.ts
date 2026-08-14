import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { getWebpayTransaction } from "@/lib/webpay";
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
  const orderId = body?.orderId;
  if (!orderId) return NextResponse.json({ error: "Falta orderId." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, tbk_token")
    .eq("id", orderId)
    .single();
  if (!order?.tbk_token) {
    return NextResponse.json({ error: "El pedido no tiene transacción de Webpay." }, { status: 400 });
  }

  const tx = getWebpayTransaction();
  let rawStatus = "";
  let approved = false;
  let determined = false;

  // Intentamos confirmar (capturar) si aún no se confirmó; si no se puede,
  // consultamos el estado real.
  try {
    const c: any = await tx.commit(order.tbk_token);
    determined = true;
    rawStatus = c?.status || "";
    approved = c?.response_code === 0 && c?.status === "AUTHORIZED";
  } catch {
    try {
      const st: any = await tx.status(order.tbk_token);
      determined = true;
      rawStatus = st?.status || "";
      approved = st?.response_code === 0 && st?.status === "AUTHORIZED";
    } catch {
      determined = false;
    }
  }

  if (!determined) {
    return NextResponse.json(
      { error: "No se pudo consultar el estado en Webpay." },
      { status: 502 }
    );
  }

  let payment_status: string;
  let status: string;
  if (approved) {
    payment_status = "pagado";
    status = "confirmado";
  } else if (rawStatus === "INITIALIZED" || rawStatus === "") {
    payment_status = "iniciado";
    status = "pendiente";
  } else {
    payment_status = "rechazado";
    status = "cancelado";
  }

  await supabase.from("orders").update({ payment_status, status }).eq("id", orderId);

  if (approved && hasBsale()) {
    try {
      const { emitDocumentForOrder } = await import("@/lib/bsale/billing");
      await emitDocumentForOrder(orderId);
    } catch {
      /* best-effort */
    }
  }

  return NextResponse.json({ ok: true, approved, payment_status, status, rawStatus });
}
