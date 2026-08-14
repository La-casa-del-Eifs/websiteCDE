"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Images, ExternalLink, Loader2, Check, Save, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";
import { formatCurrency } from "@/lib/format";

type Row = Product & { _offer: string; _saving: boolean; _saved: boolean };

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

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  async function save(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setRow(id, { _saving: true, _saved: false });
    try {
      const supabase = createClient();
      const offer = Number(row._offer) || 0;
      const { error } = await supabase
        .from("products")
        .update({ featured: !!row.featured, offer_price: offer > 0 ? offer : null })
        .eq("id", id);
      if (error) throw error;
      setRow(id, { _saving: false, _saved: true, offer_price: offer > 0 ? offer : null });
      setTimeout(() => setRow(id, { _saved: false }), 2000);
    } catch {
      setRow(id, { _saving: false });
    }
  }

  return (
    <div className="card mt-5 overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-medium">Producto</th>
            <th className="px-4 py-3 text-right font-medium">Precio</th>
            <th className="px-4 py-3 text-right font-medium">Stock</th>
            <th className="px-4 py-3 text-center font-medium">Destacado</th>
            <th className="px-4 py-3 font-medium">Oferta $</th>
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{p.name}</p>
                {p.sku && <p className="text-xs text-ink-muted">{p.sku}</p>}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(p.price)}</td>
              <td className="px-4 py-3 text-right text-ink-soft">{p.stock}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => setRow(p.id, { featured: !p.featured })}
                  disabled={!configured}
                  className="rounded-lg p-1.5 disabled:opacity-40"
                  title={p.featured ? "Destacado (se muestra en el inicio)" : "No destacado"}
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
                    onClick={() => save(p.id)}
                    disabled={p._saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                  >
                    {p._saving ? <Loader2 size={14} className="animate-spin" /> : p._saved ? <Check size={14} /> : <Save size={14} />}
                    {p._saved ? "Guardado" : "Guardar"}
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
  );
}
