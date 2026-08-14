import { Search, Plus, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getCustomers } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import type { CustomerStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Clientes" };

const statusStyle: Record<CustomerStatus, string> = {
  activo: "bg-green-100 text-green-800",
  prospecto: "bg-blue-100 text-blue-800",
  inactivo: "bg-gray-100 text-gray-600",
};

export default async function ClientesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw = "" } = await searchParams;
  const q = qRaw.toLowerCase();
  let customers = await getCustomers();
  if (q) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {customers.length} cliente{customers.length !== 1 ? "s" : ""} en tu
            base de datos.
          </p>
        </div>
        <button className="btn-primary" type="button" title="Conecta Supabase para crear clientes">
          <Plus size={17} /> Nuevo cliente
        </button>
      </div>

      <form action="/dashboard/clientes" method="get" className="mt-6 max-w-sm">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            name="q"
            defaultValue={qRaw}
            placeholder="Buscar por nombre, empresa o correo..."
            className="input pl-9"
          />
        </div>
      </form>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Ciudad</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-brand-50 last:border-0 hover:bg-brand-50/50"
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{c.name}</p>
                  {c.company && (
                    <p className="text-xs text-ink-muted">{c.company}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  {c.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail size={13} className="text-brand-400" /> {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={13} className="text-brand-400" /> {c.phone}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-soft">{c.city ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  {formatDate(c.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
