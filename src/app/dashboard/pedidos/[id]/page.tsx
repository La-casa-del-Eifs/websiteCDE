import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { getOrderById } from "@/lib/data/admin";
import { getOffices } from "@/lib/data/catalog";
import { formatCurrency, formatDate } from "@/lib/format";
import OrderActions from "@/components/dashboard/OrderActions";
import OrderStatusSelect from "@/components/dashboard/OrderStatusSelect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Detalle de pedido" };

export default async function PedidoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, offices] = await Promise.all([getOrderById(id), getOffices()]);
  if (!data) notFound();
  const { order, items } = data;
  const officeName = offices.find((o) => o.id === Number(order.office_id))?.name;

  const Row = ({ label, value }: { label: string; value: any }) =>
    value ? (
      <div className="flex justify-between gap-4 py-1.5 text-sm">
        <dt className="text-ink-soft">{label}</dt>
        <dd className="text-right font-medium text-ink">{value}</dd>
      </div>
    ) : null;

  return (
    <div>
      <Link href="/dashboard/pedidos" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeft size={16} /> Volver a Pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">
          Pedido {order.buy_order || order.id.slice(0, 8)}
        </h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
            {order.status}
          </span>
          {order.payment_status && (
            <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-brand-900">
              pago: {order.payment_status}
            </span>
          )}
        </div>
      </div>

      {order.bsale_error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span><b>Error de facturación Bsale:</b> {order.bsale_error}</span>
        </div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Ítems */}
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 text-right font-medium">Cant.</th>
                <th className="px-4 py-3 text-right font-medium">Precio</th>
                <th className="px-4 py-3 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, i: number) => (
                <tr key={i} className="border-b border-brand-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{it.product?.name || "—"}</p>
                    {it.product?.sku && <p className="text-xs text-ink-muted">{it.product.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-soft">{it.quantity}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{formatCurrency(Number(it.unit_price))}</td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    {formatCurrency(Number(it.unit_price) * Number(it.quantity))}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-ink-muted" colSpan={4}>Sin detalle de ítems.</td></tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-brand-100 p-4 text-right">
            <span className="text-sm text-ink-soft">Total: </span>
            <span className="text-lg font-bold text-brand-700">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Info + acciones */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-2 font-semibold text-ink">Comprador</h2>
            <dl>
              <Row label="Nombre" value={order.buyer_name} />
              <Row label="Correo" value={order.buyer_email} />
              <Row label="Teléfono" value={order.buyer_phone} />
              <Row label="RUT" value={order.buyer_rut} />
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 font-semibold text-ink">Entrega</h2>
            <dl>
              <Row label="Método" value={order.delivery_method} />
              <Row label="Sucursal" value={officeName || (order.office_id ? `#${order.office_id}` : null)} />
              <Row label="Dirección" value={order.address} />
              <Row label="Comuna" value={order.comuna} />
              <Row label="Ciudad" value={order.city} />
              <Row label="Fecha" value={formatDate(order.created_at)} />
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-ink">Estado del pedido</h2>
            <OrderStatusSelect orderId={order.id} current={order.status} />
          </div>

          {order.doc_type === "factura" && (
            <div className="card p-5">
              <h2 className="mb-2 font-semibold text-ink">Datos de factura</h2>
              <dl>
                <Row label="Razón social" value={order.factura_razon_social} />
                <Row label="RUT" value={order.factura_rut} />
                <Row label="Giro" value={order.factura_giro} />
                <Row label="Dirección" value={order.factura_direccion} />
                <Row label="Comuna" value={order.factura_comuna} />
                <Row label="Correo" value={order.factura_email} />
              </dl>
            </div>
          )}

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-ink">
              Pago y facturación{" "}
              <span className="ml-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {order.doc_type === "factura" ? "Factura" : "Boleta"}
              </span>
            </h2>
            {order.bsale_document_url && (
              <a href={order.bsale_document_url} target="_blank" rel="noopener noreferrer" className="btn-outline mb-3 inline-flex">
                <FileText size={16} /> Ver documento
                {order.bsale_document_number ? ` N° ${order.bsale_document_number}` : ""}
              </a>
            )}
            {!process.env.BSALE_DOCUMENT_TYPE_ID && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Para emitir boletas configura <b>BSALE_DOCUMENT_TYPE_ID</b> en
                .env.local (lo ves en Panel → Bsale → Probar conexión) y reinicia.
              </p>
            )}
            <OrderActions
              orderId={order.id}
              paymentStatus={order.payment_status ?? ""}
              status={order.status}
              hasDocument={!!order.bsale_document_number}
            />
            <p className="mt-2 text-xs text-ink-muted">
              "Verificar" consulta el estado real en Webpay. "Marcar pagado" es para
              cobros recibidos por otra vía.
            </p>
            {order.tbk_token && (
              <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Token Webpay (token_ws)
                </p>
                <p className="mt-1 select-all break-all font-mono text-xs text-ink">
                  {order.tbk_token}
                </p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  Este es el valor que pide la validación de Transbank (no el número de
                  pedido). Haz clic para seleccionarlo y cópialo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
