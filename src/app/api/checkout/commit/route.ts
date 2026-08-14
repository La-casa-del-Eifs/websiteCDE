import { NextResponse } from "next/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { getWebpayTransaction } from "@/lib/webpay";
import { hasBsale } from "@/lib/bsale/client";

async function handle(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const result = (status: string, order = "") =>
    NextResponse.redirect(
      `${site}/checkout/resultado?status=${status}${order ? `&order=${encodeURIComponent(order)}` : ""}`,
      303
    );

  let token: string | null = null;
  let tbkToken: string | null = null;
  const url = new URL(request.url);
  if (request.method === "POST") {
    try {
      const form = await request.formData();
      token = (form.get("token_ws") as string) || null;
      tbkToken = (form.get("TBK_TOKEN") as string) || null;
    } catch {
      /* noop */
    }
  } else {
    token = url.searchParams.get("token_ws");
    tbkToken = url.searchParams.get("TBK_TOKEN");
  }

  const admin = hasServiceRole() ? createAdminClient() : null;

  // Usuario anuló o expiró el pago.
  if (!token && tbkToken) {
    if (admin) {
      await admin
        .from("orders")
        .update({ payment_status: "anulado", status: "cancelado" })
        .eq("tbk_token", tbkToken);
    }
    return result("anulado");
  }
  if (!token) return result("error");

  try {
    const tx = getWebpayTransaction();
    const commit: any = await tx.commit(token);
    const approved = commit.response_code === 0 && commit.status === "AUTHORIZED";
    let orderId: string | null = null;
    if (admin) {
      const { data: ord } = await admin
        .from("orders")
        .update({
          payment_status: approved ? "pagado" : "rechazado",
          status: approved ? "confirmado" : "cancelado",
        })
        .eq("tbk_token", token)
        .select("id")
        .single();
      orderId = ord?.id ?? null;
    }
    // Facturación en Bsale (best-effort: no afecta el resultado del pago).
    if (approved && orderId && hasBsale()) {
      try {
        const { emitDocumentForOrder } = await import("@/lib/bsale/billing");
        await emitDocumentForOrder(orderId);
      } catch {
        /* se registra el error en el pedido; no bloquea */
      }
    }
    return result(approved ? "ok" : "rechazado", commit.buy_order || "");
  } catch {
    return result("error");
  }
}

export async function POST(request: Request) {
  return handle(request);
}
export async function GET(request: Request) {
  return handle(request);
}
