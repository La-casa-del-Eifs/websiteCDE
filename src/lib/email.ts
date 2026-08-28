import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/config";
import { formatCurrency } from "@/lib/format";

// Envía un correo vía la API de Resend (https://resend.com). Sin dependencias.
async function sendEmail(to: string[], subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) return;
  const from =
    process.env.EMAIL_FROM || `${SITE.name} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] Resend:", res.status, await res.text());
    }
  } catch (e: any) {
    console.error("[email] error:", e?.message);
  }
}

// Envía confirmación al comprador y aviso al vendedor cuando un pedido se paga.
export async function sendOrderEmails(orderId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // sin servicio configurado, no hace nada
  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (!order) return;

    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, unit_price, product:products(name)")
      .eq("order_id", orderId);

    const num = order.buy_order || String(order.id).slice(0, 8);
    const entrega =
      order.delivery_method === "retiro"
        ? "Retiro en tienda"
        : `Despacho a: ${[order.address, order.comuna, order.city].filter(Boolean).join(", ") || "—"}`;

    const rows = (items ?? [])
      .map(
        (it: any) =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee">${it.product?.name ?? "Producto"}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${it.quantity}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(
              Number(it.unit_price) * Number(it.quantity)
            )}</td>
          </tr>`
      )
      .join("");

    const table = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0">
        <thead>
          <tr style="background:#0f2b53;color:#fff">
            <th style="padding:8px;text-align:left">Producto</th>
            <th style="padding:8px">Cant.</th>
            <th style="padding:8px;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:16px;margin:0"><b>Total: ${formatCurrency(Number(order.total))}</b></p>`;

    // 1) Correo al comprador (confirmación)
    const buyerTo = order.factura_email || order.buyer_email;
    if (buyerTo) {
      await sendEmail(
        [buyerTo],
        `Confirmación de tu compra · Pedido ${num}`,
        `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#14223a">
          <h2 style="color:#0f2b53">¡Gracias por tu compra${order.buyer_name ? ", " + order.buyer_name : ""}!</h2>
          <p>Recibimos tu pedido <b>${num}</b>. Este es el detalle:</p>
          ${table}
          <p style="margin-top:14px"><b>Entrega:</b> ${entrega}</p>
          <p>Te contactaremos para coordinar. Tu boleta o factura llega por separado.</p>
          <p style="color:#8592a6;font-size:12px;margin-top:20px">${SITE.name}</p>
        </div>`
      );
    }

    // 2) Correo al vendedor (aviso de nueva venta) — a todos los correos de la empresa
    await sendEmail(
      SITE.emails,
      `Nueva compra · Pedido ${num} · ${formatCurrency(Number(order.total))}`,
      `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#14223a">
        <h2 style="color:#0f2b53">Nueva compra en el sitio</h2>
        <p style="margin:0 0 4px"><b>Pedido:</b> ${num}</p>
        <p style="margin:0 0 12px">
          <b>Cliente:</b> ${order.buyer_name || "—"}<br/>
          <b>Email:</b> ${order.buyer_email || "—"}<br/>
          <b>Teléfono:</b> ${order.buyer_phone || "—"}<br/>
          <b>RUT:</b> ${order.buyer_rut || "—"}
        </p>
        ${table}
        <p style="margin-top:14px"><b>Entrega:</b> ${entrega}</p>
        ${order.notes ? `<p><b>Notas:</b> ${order.notes}</p>` : ""}
        ${order.doc_type === "factura" ? `<p><b>Factura a:</b> ${order.factura_razon_social || ""} (${order.factura_rut || ""})</p>` : ""}
      </div>`
    );
  } catch (e: any) {
    console.error("[email] sendOrderEmails:", e?.message);
  }
}
