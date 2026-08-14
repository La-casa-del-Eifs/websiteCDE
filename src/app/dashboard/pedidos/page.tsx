import Link from "next/link";
import type { Metadata } from "next";
import { getOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Pedidos" };

const statusStyle: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-blue-100 text-blue-800",
  en_proceso: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-700",
};
const payStyle: Record<string, string> = {
  iniciado: "bg-amber-100 text-amber-800",
  pagado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-700",
  anulado: "bg-gray-100 text-gray-600",
  error: "bg-red-100 text-red-700",
};

export default async function PedidosPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Pedidos</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {orders.length} pedido{orders.length !== 1 ? "s" : ""}.
      </p>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Pedido</th>
              <th className="px-5 py-3 font-medium">Comprador</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Pago</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/50">
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/pedidos/${o.id}`}
                    className="font-medium text-brand-700 hover:text-brand-800"
                  >
                    {o.buy_order || o.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-soft">{o.buyer_name || "—"}</td>
                <td className="px-5 py-3 text-ink-soft">{formatDate(o.created_at)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {o.payment_status && (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${payStyle[o.payment_status] || "bg-gray-100 text-gray-600"}`}>
                      {o.payment_status}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-ink">
                  {formatCurrency(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
