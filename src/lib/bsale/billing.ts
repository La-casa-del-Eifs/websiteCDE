import { bsaleGet, bsalePost } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

const IVA = 1.19; // 19% Chile

// Bsale espera el RUT sin puntos y con guión: 21017382-K
function rutForBsale(rut: string): string {
  const c = String(rut || "").replace(/[^0-9kK]/g, "").toUpperCase();
  if (c.length < 2) return c;
  return `${c.slice(0, -1)}-${c.slice(-1)}`;
}

// Cliente persona (boleta): busca por RUT o crea.
export async function findOrCreateClient(order: any): Promise<number | null> {
  const rut = rutForBsale(order.buyer_rut || "");
  if (!rut) return null;
  try {
    const found = await bsaleGet(`clients.json?code=${encodeURIComponent(rut)}`);
    if (found?.items?.length) return Number(found.items[0].id);
  } catch {
    /* si no existe, Bsale puede devolver 404 */
  }
  try {
    const parts = String(order.buyer_name || "").trim().split(/\s+/);
    const created = await bsalePost("clients.json", {
      firstName: parts[0] || order.buyer_name || "Cliente",
      lastName: parts.slice(1).join(" ") || "",
      code: rut,
      email: order.buyer_email || undefined,
      phone: order.buyer_phone || undefined,
    });
    return created?.id ? Number(created.id) : null;
  } catch {
    return null;
  }
}

// Cliente empresa (factura): con razón social, giro y dirección.
async function findOrCreateFacturaClient(order: any): Promise<number | null> {
  const rut = rutForBsale(order.factura_rut || "");
  if (!rut) return null;
  try {
    const found = await bsaleGet(`clients.json?code=${encodeURIComponent(rut)}`);
    if (found?.items?.length) return Number(found.items[0].id);
  } catch {
    /* 404 si no existe */
  }
  try {
    const created = await bsalePost("clients.json", {
      company: order.factura_razon_social || "",
      code: rut,
      activity: order.factura_giro || undefined,
      address: order.factura_direccion || undefined,
      municipality: order.factura_comuna || undefined,
      city: order.factura_comuna || undefined,
      email: order.factura_email || undefined,
    });
    return created?.id ? Number(created.id) : null;
  } catch {
    return null;
  }
}

// Emite boleta o factura según el pedido. Best-effort.
export async function emitDocumentForOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.bsale_document_id) return;

  const isFactura = order.doc_type === "factura";
  const docTypeId = isFactura
    ? Number(process.env.BSALE_FACTURA_TYPE_ID || 0)
    : Number(process.env.BSALE_DOCUMENT_TYPE_ID || 0);

  if (!docTypeId) {
    const key = isFactura ? "BSALE_FACTURA_TYPE_ID" : "BSALE_DOCUMENT_TYPE_ID";
    try {
      await supabase
        .from("orders")
        .update({
          bsale_error: `Falta ${key} en .env.local (id del tipo de documento). Míralo en Panel > Bsale > Probar conexión y reinicia el servidor.`,
        })
        .eq("id", orderId);
    } catch {
      /* noop */
    }
    return;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("quantity, unit_price, product:products(name, bsale_variant_id)")
    .eq("order_id", orderId);

  const details = (items ?? []).map((it: any) => {
    const net = Math.round(Number(it.unit_price) / IVA);
    const vid = it.product?.bsale_variant_id;
    return vid
      ? { variantId: Number(vid), quantity: Number(it.quantity), netUnitValue: net }
      : { comment: it.product?.name || "Producto", quantity: Number(it.quantity), netUnitValue: net };
  });

  try {
    const clientId = isFactura
      ? await findOrCreateFacturaClient(order)
      : await findOrCreateClient(order);
    const emailTo = isFactura ? order.factura_email : order.buyer_email;

    const body: any = {
      documentTypeId: docTypeId,
      officeId: Number(order.office_id || process.env.BSALE_OFFICE_ID || 1),
      emissionDate: Math.floor(Date.now() / 1000),
      declareSii: 1,
      details,
    };
    if (clientId) body.clientId = clientId;
    if (emailTo) body.sendEmail = 1;

    const doc = await bsalePost("documents.json", body);
    await supabase
      .from("orders")
      .update({
        bsale_client_id: clientId,
        bsale_document_id: doc?.id ? Number(doc.id) : null,
        bsale_document_number: doc?.number != null ? String(doc.number) : null,
        bsale_document_url:
          doc?.urlPdf || doc?.urlPublicView || doc?.urlTimbre || doc?.href || null,
        bsale_error: null,
      })
      .eq("id", orderId);
  } catch (e: any) {
    await supabase
      .from("orders")
      .update({ bsale_error: String(e?.message || "error").slice(0, 300) })
      .eq("id", orderId);
  }
}
