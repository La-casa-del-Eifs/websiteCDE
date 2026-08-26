"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Star,
  Images,
  ExternalLink,
  Loader2,
  Check,
  Save,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";
import { formatCurrency } from "@/lib/format";

type Row = Product & { _offer: string; _saving: boolean; _saved: boolean };

type Filtro = "todos" | "visibles" | "ocultos";

const PERM_MSG =
  "No se guardó: parece un tema de permisos (RLS). En Supabase verifica que exista la política products_staff_update y que tu usuario sea admin o vendedor.";

export default function ProductsManager({
  products,
  configured,
}: {
  products: Product[];
  configured: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    products.map((p) => ({
      ...p,
      _offer: p.offer_price ? String(p.offer_price) : "",
      _saving: false,
      _saved: false,
    }))
  );
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [error, setError] = useState<string | null>(null);

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const visiblesCount = rows.filter((r) => !r.hidden).length;
  const ocultosCount = rows.filter((r) => r.hidden).length;

  const shown = rows.filter((r) =>
    filtro === "todos" ? true : filtro === "ocultos" ? !!r.hidden : !r.hidden
  );

  // Marcar/desmarcar destacado: se guarda al instante (optimista + reversión si falla).
  async function toggleFeatured(p: Row) {
    if (!configured) return;
    const next = !p.featured;
    setRow(p.id, { featured: next });
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .update({ featured: next })
        .eq("id", p.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(PERM_MSG);
    } catch (err: any) {
      setRow(p.id, { featured: !next }); // revertir
      setError(err?.message || "No se pudo guardar el destacado.");
    }
  }

  // Ocultar/mostrar en el catálogo: se guarda al instante (optimista + reversión si falla).
  async function toggleHidden(p: Row) {
    if (!configured) return;
    const next = !p.hidden;
    setRow(p.id, { hidden: next });
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .update({ hidden: next })
        .eq("id", p.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(PERM_MSG);
    } catch (err: any) {
      setRow(p.id, { hidden: !next }); // revertir
      setError(
        err?.message ||
          "No se pudo cambiar la visibilidad. Si nunca corriste la migración 019, agrega la columna 'hidden' en Supabase."
      );
    }
  }

  async function saveOffer(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setRow(id, { _saving: true, _saved: false });
    setError(null);
    try {
      const supabase = createClient();
      const offer = Number(row._offer) || 0;
      const { data, error } = await supabase
        .from("products")
        .update({ offer_price: offer > 0 ? offer : null })
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(PERM_MSG);
      setRow(id, { _saving: false, _saved: true, offer_price: offer > 0 ? offer : null });
      setTimeout(() => setRow(id, { _saved: false }), 2000);
    } catch (err: any) {
      setRow(id, { _saving: false });
      setError(err?.message || "No se pudo guardar la oferta.");
    }
  }

  const tabCls = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-brand-600 text-white"
        : "border border-brand-200 bg-white text-ink-soft hover:bg-brand-50"
    }`;

  return (
    <div>
      {/* Filtro por visibilidad */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setFiltro("todos")} className={tabCls(filtro === "todos")}>
          Todos ({rows.length})
        </button>
        <button onClick={() => setFiltro("visibles")} className={tabCls(filtro === "visibles")}>
          Visibles ({visiblesCount})
        </button>
        <button onClick={() => setFiltro("ocultos")} className={tabCls(filtro === "ocultos")}>
          Ocultos ({ocultosCount})
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Stock</th>
              <th className="px-4 py-3 text-center font-medium">Visible</th>
              <th className="px-4 py-3 text-center font-medium">Destacado</th>
              <th className="px-4 py-3 font-medium">Oferta $</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No hay productos en esta vista.
                </td>
              </tr>
            )}
            {shown.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-brand-50 last:border-0 hover:bg-brand-50/40 ${
                  p.hidden ? "bg-brand-50/30" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${p.hidden ? "text-ink-muted" : "text-ink"}`}>
                      {p.name}
                    </p>
                    {p.hidden && (
                      <span className="rounded-full bg-ink-muted/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                        Oculto
                      </span>
                    )}
                  </div>
                  {p.sku && <p className="text-xs text-ink-muted">{p.sku}</p>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3 text-right text-ink-soft">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleHidden(p)}
                    disabled={!configured}
                    className="rounded-lg p-1.5 disabled:opacity-40"
                    title={
                      p.hidden
                        ? "Oculto: no se muestra en el catálogo. Clic para mostrar."
                        : "Visible en el catálogo. Clic para ocultar."
                    }
                  >
                    {p.hidden ? (
                      <EyeOff size={18} className="text-ink-muted" />
                    ) : (
                      <Eye size={18} className="text-green-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleFeatured(p)}
                    disabled={!configured}
                    className="rounded-lg p-1.5 disabled:opacity-40"
                    title={p.featured ? "Destacado (se muestra en el inicio). Clic para quitar." : "Clic para destacar"}
                  >
                    <Star size={18} className={p.featured ? "fill-gold-400 text-gold-400" : "text-ink-muted"} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    disabled={!configured}
                    value={p._offer}
                    onChange={(e) => setRow(p.id, { _offer: e.target.value })}
                    placeholder="—"
                    className="w-24 rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none disabled:bg-brand-50 disabled:opacity-60"
                  />
                </td>
                <td className="px-4 py-3">
                  {configured ? (
                    <button
                      onClick={() => saveOffer(p.id)}
                      disabled={p._saving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                    >
                      {p._saving ? <Loader2 size={14} className="animate-spin" /> : p._saved ? <Check size={14} /> : <Save size={14} />}
                      {p._saved ? "Guardado" : "Guardar oferta"}
                    </button>
                  ) : (
                    <span className="text-xs text-ink-muted">demo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/dashboard/productos/${p.id}/editar`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                      <Pencil size={13} /> Editar
                    </Link>
                    <Link href={`/dashboard/productos/${p.id}/imagenes`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                      <Images size={13} /> Imágenes
                    </Link>
                    <Link href={`/catalogo/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-brand-700">
                      Ver <ExternalLink size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
