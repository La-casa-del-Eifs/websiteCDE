"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

export default function CategoriesManager({
  categories,
  configured,
}: {
  categories: Category[];
  configured: boolean;
}) {
  const [rows, setRows] = useState<Category[]>(() =>
    [...categories].sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
    )
  );
  const [busy, setBusy] = useState(false);

  async function persistOrder(list: Category[]) {
    const supabase = createClient();
    await Promise.all(
      list.map((c, i) =>
        supabase.from("categories").update({ sort_order: i }).eq("id", c.id)
      )
    );
  }

  async function toggleFeatured(cat: Category) {
    setBusy(true);
    try {
      const supabase = createClient();
      const next = !cat.featured;
      await supabase.from("categories").update({ featured: next }).eq("id", cat.id);
      setRows((rs) => rs.map((r) => (r.id === cat.id ? { ...r, featured: next } : r)));
    } finally {
      setBusy(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    setBusy(true);
    try {
      const list = [...rows];
      [list[idx], list[j]] = [list[j], list[idx]];
      const withOrder = list.map((c, i) => ({ ...c, sort_order: i }));
      setRows(withOrder);
      await persistOrder(withOrder);
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-5 p-6 text-sm text-ink-soft">
        Conecta Supabase y corre <code className="rounded bg-brand-50 px-1">migration_011_categories.sql</code>{" "}
        para administrar las categorías.
      </div>
    );
  }

  const shownCount = rows.filter((r) => r.featured).length;

  return (
    <div className="mt-5">
      <p className="mb-3 text-sm text-ink-soft">
        {shownCount} categoría{shownCount !== 1 ? "s" : ""} visible
        {shownCount !== 1 ? "s" : ""} en el inicio. Usa el ojo para mostrar/ocultar
        y las flechas para ordenar.
      </p>
      <div className="card divide-y divide-brand-50">
        {rows.map((c, idx) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 px-4 py-3 ${c.featured ? "" : "opacity-60"}`}
          >
            <button
              onClick={() => toggleFeatured(c)}
              disabled={busy}
              className={`rounded-lg p-2 ${
                c.featured ? "bg-gold-100 text-brand-900" : "text-ink-muted hover:bg-brand-50"
              }`}
              title={c.featured ? "Se muestra en el inicio" : "Oculta en el inicio"}
            >
              {c.featured ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{c.name}</p>
              {c.featured && (
                <span className="text-[11px] font-medium text-brand-600">En el inicio</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(idx, -1)} disabled={busy || idx === 0} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40" aria-label="Subir">
                <ArrowUp size={16} />
              </button>
              <button onClick={() => move(idx, 1)} disabled={busy || idx === rows.length - 1} className="rounded-lg p-1.5 text-ink-soft hover:bg-brand-50 disabled:opacity-40" aria-label="Bajar">
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
