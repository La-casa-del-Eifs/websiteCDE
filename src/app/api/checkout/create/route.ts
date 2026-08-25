import { NextResponse } from "next/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import { getWebpayTransaction } from "@/lib/webpay";
import { siteOrigin } from "@/lib/site-url";

interface ReqItem { id: string; qty: number }

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const items: ReqItem[] = Array.isArray(body?.items) ? body.items : [];
  const buyer = body?.buyer ?? {};
  const delivery = body?.delivery ?? {};
  const doc = body?.document ?? {};

  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (!isSupabaseConfigured() || !hasServiceRole()) {
    return NextResponse.json(
      {
        error:
          "Falta configurar Supabase (SUPABASE_SERVICE_ROLE_KEY) para registrar el pedido. Revisa el README.",
      },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  // Precios desde el servidor (nunca confiar en el cliente).
  const ids = items.map((i) => i.id);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, offer_price, active")
    .in("id", ids);
  if (prodErr) {
    return NextResponse.json({ error: "No se pudieron leer los productos." }, { status: 500 });
  }

  // Precio de empresa si el comprador tiene lista de precio asignada.
  const priceOverride = new Map<string, number>();
  if (buyer.user_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role, bsale_price_list_id")
      .eq("id", buyer.user_id)
      .single();
    if (prof?.role === "empresa" && prof.bsale_price_list_id) {
      const { data: pp } = await supabase
        .from("product_prices")
        .select("product_id, price")
        .eq("price_list_id", prof.bsale_price_list_id)
        .in("product_id", ids);
      (pp ?? []).forEach((x: any) => priceOverride.set(x.product_id, Number(x.price)));
    }
  }

  let subtotal = 0;
  const orderItems: { product_id: string; quantity: number; unit_price: number }[] = [];
  for (const it of items) {
    const p = products?.find((x) => x.id === it.id);
    if (!p || !p.active) continue;
    const qty = Math.max(1, Number(it.qty) || 1);
    const base = Number(p.price) || 0;
    const off = Number((p as any).offer_price ?? 0);
    const listOrOffer = off > 0 && off < base ? off : base;
    const price = priceOverride.get(p.id) ?? listOrOffer;
    subtotal += price * qty;
    orderItems.push({ product_id: p.id, quantity: qty, unit_price: price });
  }

  const total = Math.round(subtotal); // despacho se calcula/ajusta luego
  if (total <= 0 || orderItems.length === 0) {
    return NextResponse.json({ error: "Monto inválido." }, { status: 400 });
  }

  const buyOrder = ("O" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6))
    .slice(0, 26)
    .toUpperCase();

  const fullName = [buyer.first_name, buyer.apellido_paterno, buyer.apellido_materno]
    .filter(Boolean)
    .join(" ")
    .trim();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      buy_order: buyOrder,
      status: "pendiente",
      payment_status: "iniciado",
      total,
      subtotal: Math.round(subtotal),
      user_id: buyer.user_id || null,
      buyer_name: fullName || null,
      buyer_email: buyer.email || null,
      buyer_phone: buyer.phone || null,
      buyer_rut: buyer.rut || null,
      delivery_method: delivery.method || null,
      office_id: delivery.office_id ? Number(delivery.office_id) : null,
      doc_type: doc.doc_type === "factura" ? "factura" : "boleta",
      factura_razon_social: doc.razon_social || null,
      factura_rut: doc.rut || null,
      factura_giro: doc.giro || null,
      factura_direccion: doc.direccion || null,
      factura_comuna: doc.comuna || null,
      factura_email: doc.email || null,
      address: delivery.address || null,
      comuna: delivery.comuna || null,
      city: delivery.city || null,
      notes: delivery.notes || null,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));
  if (itemsErr) {
    return NextResponse.json({ error: "No se pudo guardar el detalle del pedido." }, { status: 500 });
  }

  // Crear transacción Webpay.
  // El dominio de retorno se detecta desde el request (dominio real de Vercel),
  // así Webpay siempre devuelve al sitio correcto y no a localhost.
  const site = siteOrigin(request);
  const returnUrl = `${site}/api/checkout/commit`;
  try {
    const tx = getWebpayTransaction();
    const resp = await tx.create(buyOrder, String(order.id), total, returnUrl);
    await supabase.from("orders").update({ tbk_token: resp.token }).eq("id", order.id);
    return NextResponse.json({ url: resp.url, token: resp.token });
  } catch {
    await supabase
      .from("orders")
      .update({ payment_status: "error", status: "cancelado" })
      .eq("id", order.id);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Webpay. Inténtalo nuevamente." },
      { status: 502 }
    );
  }
}
