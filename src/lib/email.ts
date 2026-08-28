import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/config";
import { formatCurrency } from "@/lib/format";

// Envía un correo vía la API de Resend (https://resend.com). Sin dependencias.
async function sendEmail(to: string[], subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) return;
  const from = process.env.EMAIL_FROM || `${SITE.name} <onboarding@resend.dev>`;
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

// Plantilla corporativa: cabecera navy con la marca + pie con datos de contacto.
function wrapEmail(bodyHtml: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  // Con logo (necesita URL pública del sitio); si no, cabecera de texto.
  const header = base
    ? `<div style="background:#ffffff;padding:22px 28px;text-align:center;border-bottom:3px solid #ffcb00">
         <img src="${base}/logo.png" alt="La Casa del EIFS" width="190" style="max-width:190px;height:auto;display:inline-block;border:0" />
       </div>`
    : `<div style="background:#0f2b53;padding:26px 28px;text-align:center">
         <div style="font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:1px">LA CASA DEL <span style="color:#ffcb00">EIFS</span></div>
         <div style="color:#ffcb00;font-size:11px;margin-top:6px;letter-spacing:2px;text-transform:uppercase">Sistemas EIFS para fachadas</div>
       </div>`;
  return `
  <div style="background:#f4f7fb;padding:28px 12px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e9f0">
      ${header}
      <div style="padding:30px 28px;color:#14223a;font-size:15px;line-height:1.6">
        ${bodyHtml}
      </div>
      <div style="background:#f4f7fb;padding:20px 28px;border-top:1px solid #e5e9f0;color:#46536a;font-size:12px;line-height:1.7">
        <b style="color:#0f2b53">${SITE.name}</b><br/>
        ${SITE.phones.join(" &nbsp;·&nbsp; ")}<br/>
        ${SITE.emails[0]}<br/>
        ${SITE.addresses.join("<br/>")}
      </div>
    </div>
  </div>`;
}

function itemsTable(items: any[], total: number): string {
  const rows = (items ?? [])
    .map(
      (it: any) =>
        `<tr>
          <td style="padding:9px 10px;border-bottom:1px solid #eef1f6">${it.product?.name ?? "Producto"}</td>
          <td style="padding:9px 10px;border-bottom:1px solid #eef1f6;text-align:center">${it.quantity}</td>
          <td style="padding:9px 10px;border-bottom:1px solid #eef1f6;text-align:right">${formatCurrency(
            Number(it.unit_price) * Number(it.quantity)
          )}</td>
        </tr>`
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="background:#0f2b53;color:#ffffff">
          <th style="padding:10px;text-align:left;border-radius:6px 0 0 0">Producto</th>
          <th style="padding:10px">Cant.</th>
          <th style="padding:10px;text-align:right;border-radius:0 6px 0 0">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:right;margin-top:2px">
      <span style="display:inline-block;background:#ffcb00;color:#0f2b53;font-weight:bold;font-size:16px;padding:8px 18px;border-radius:8px">
        Total: ${formatCurrency(total)}
      </span>
    </div>`;
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
    const table = itemsTable(items ?? [], Number(order.total));

    // 1) Correo al comprador (confirmación) — corporativo
    const buyerTo = order.factura_email || order.buyer_email;
    if (buyerTo) {
      await sendEmail(
        [buyerTo],
        `Confirmación de tu compra · Pedido ${num}`,
        wrapEmail(
          `<h2 style="color:#0f2b53;margin:0 0 10px;font-size:20px">
             ¡Gracias por tu compra${order.buyer_name ? ", " + order.buyer_name : ""}!
           </h2>
           <p style="margin:0 0 4px">Recibimos tu pedido <b>N° ${num}</b> y ya lo estamos procesando.</p>
           <p style="margin:0;color:#46536a">A continuación, el resumen de tu compra:</p>
           ${table}
           <p style="margin:18px 0 4px"><b>Método de entrega:</b> ${entrega}</p>
           <p style="margin:14px 0 0;color:#46536a">
             Tu <b>boleta o factura electrónica</b> llega en un correo aparte. Un ejecutivo se
             pondrá en contacto para coordinar la entrega. Si tienes cualquier duda, responde
             este correo y con gusto te ayudamos.
           </p>
           <p style="margin:20px 0 0">Gracias por preferirnos,<br/><b style="color:#0f2b53">Equipo La Casa del EIFS</b></p>`
        )
      );
    }

    // 2) Correo al vendedor (aviso de nueva venta) — a los correos de notificación
    await sendEmail(
      SITE.orderNotifyEmails,
      `🛒 Nueva compra · Pedido ${num} · ${formatCurrency(Number(order.total))}`,
      wrapEmail(
        `<h2 style="color:#0f2b53;margin:0 0 10px;font-size:20px">Nueva compra en el sitio</h2>
         <p style="margin:0 0 4px"><b>Pedido:</b> N° ${num}</p>
         <p style="margin:0 0 12px;color:#46536a">
           <b style="color:#14223a">Cliente:</b> ${order.buyer_name || "—"}<br/>
           <b style="color:#14223a">Email:</b> ${order.buyer_email || "—"}<br/>
           <b style="color:#14223a">Teléfono:</b> ${order.buyer_phone || "—"}<br/>
           <b style="color:#14223a">RUT:</b> ${order.buyer_rut || "—"}
         </p>
         ${table}
         <p style="margin:18px 0 4px"><b>Entrega:</b> ${entrega}</p>
         ${order.notes ? `<p style="margin:4px 0"><b>Notas:</b> ${order.notes}</p>` : ""}
         ${
           order.doc_type === "factura"
             ? `<p style="margin:4px 0"><b>Factura a:</b> ${order.factura_razon_social || ""} (${order.factura_rut || ""})</p>`
             : ""
         }`
      )
    );
  } catch (e: any) {
    console.error("[email] sendOrderEmails:", e?.message);
  }
}
