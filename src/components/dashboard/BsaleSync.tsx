"use client";

import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function BsaleSync() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/bsale/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data?.error || "No se pudo sincronizar.");
      else setSummary(data.summary);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6 p-6">
      <h2 className="text-lg font-bold text-ink">Sincronizar catálogo</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Trae productos, categorías, precios (con IVA) y stock desde Bsale al
        catálogo. Puede tardar varios minutos si tienes muchos productos.
      </p>
      <button onClick={sync} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
        {loading ? "Sincronizando..." : "Sincronizar productos y stock"}
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={18} /> Sincronización completa.
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Productos</p>
              <p className="mt-1 text-xl font-bold text-ink">{summary.products}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Categorías</p>
              <p className="mt-1 text-xl font-bold text-ink">{summary.categories}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Desactivados</p>
              <p className="mt-1 text-xl font-bold text-ink">{summary.deactivated}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Lista de precios #{summary.priceListId} · {summary.withPrice} con precio ·{" "}
            {summary.withStock} con stock.
          </p>
        </div>
      )}
    </div>
  );
}
