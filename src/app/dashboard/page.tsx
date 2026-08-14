import Link from "next/link";
import {
  Package,
  Users,
  UserCog,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";
import KpiCard from "@/components/dashboard/KpiCard";
import { getKpis, getRecentOrders, getViewer } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Resumen" };

const statusStyle: Record<OrderStatus, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-blue-100 text-blue-800",
  en_proceso: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-700",
};

const statusLabel: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_proceso: "En proceso",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { role, name } = await getViewer();
  const isStaff = role === "admin" || role === "vendedor";

  // Vista simplificada para clientes / empresas / usuarios sin permisos de gestión.
  if (!isStaff) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ink">Hola, {name}</h1>
        <p className="mt-2 text-ink-soft">
          Bienvenido a tu cuenta de La Casa del Eifs.
        </p>
        {role === "empresa" && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-gold-100 px-4 py-3 text-brand-900">
            <span className="text-sm">
              Tu empresa tiene una <b>lista de precio especial</b> aplicada a tus
              compras.
            </span>
          </div>
        )}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Link href="/catalogo" className="card p-6 transition hover:border-brand-300">
            <Package className="text-brand-600" size={24} />
            <h2 className="mt-3 font-semibold text-ink">Explorar catálogo</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Revisa productos, precios y disponibilidad.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              Ir al catálogo <ArrowRight size={15} />
            </span>
          </Link>
          <Link href="/contacto" className="card p-6 transition hover:border-brand-300">
            <ShoppingBag className="text-brand-600" size={24} />
            <h2 className="mt-3 font-semibold text-ink">Solicitar cotización</h2>
            <p className="mt-1 text-sm text-ink-soft">
              ¿Necesitas material para tu obra? Escríbenos.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              Contactar <ArrowRight size={15} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const [kpis, orders] = await Promise.all([getKpis(), getRecentOrders()]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Resumen</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Vista general del negocio, {name}.
          </p>
        </div>
        <Link href="/dashboard/productos" className="btn-primary">
          Gestionar productos
        </Link>
      </div>

      {error === "sin_permiso" && (
        <p className="mt-5 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          No tienes permisos para acceder a esa sección.
        </p>
      )}

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ingresos"
          value={formatCurrency(kpis.revenue)}
          hint="Suma de pedidos no cancelados"
          icon={DollarSign}
        />
        <KpiCard
          title="Pedidos"
          value={kpis.totalOrders}
          hint={`${kpis.pendingOrders} pendientes`}
          icon={ShoppingBag}
        />
        <KpiCard
          title="Clientes"
          value={kpis.totalCustomers}
          hint="En la base de datos"
          icon={Users}
        />
        <KpiCard
          title="Usuarios"
          value={kpis.totalUsers}
          hint="Con acceso al sistema"
          icon={UserCog}
        />
        <KpiCard
          title="Productos"
          value={kpis.totalProducts}
          hint={`${kpis.activeProducts} activos`}
          icon={Package}
        />
        <KpiCard
          title="Pedidos pendientes"
          value={kpis.pendingOrders}
          hint="Por confirmar"
          icon={Clock}
        />
        <KpiCard
          title="Stock bajo"
          value={kpis.lowStock}
          hint="Productos con < 80 uds."
          icon={AlertTriangle}
        />
        <KpiCard
          title="Productos activos"
          value={kpis.activeProducts}
          hint="Visibles en el catálogo"
          icon={CheckCircle2}
        />
      </div>

      {/* Pedidos recientes */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-ink">Pedidos recientes</h2>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-brand-50 last:border-0 hover:bg-brand-50/50"
                >
                  <td className="px-5 py-3 font-medium text-ink">
                    {o.customer?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[o.status]}`}
                    >
                      {statusLabel[o.status]}
                    </span>
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
    </div>
  );
}
