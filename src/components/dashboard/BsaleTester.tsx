"use client";

import { useState } from "react";
import { Plug, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function BsaleTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function test() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/bsale/test");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "No se pudo conectar.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button onClick={test} disabled={loading} className="btn-primary">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Plug size={17} />}
        Probar conexión
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result?.ok && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={18} /> ¡Conexión exitosa con Bsale!
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {Object.entries(result.counts).map(([k, v]) => (
              <div key={k} className="card p-4">
                <p className="text-xs uppercase tracking-wide text-ink-muted">{k}</p>
                <p className="mt-1 text-xl font-bold text-ink">{String(v)}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-ink-soft">
              Ejemplo de producto (compárteme esto para armar la sincronización):
            </p>
            <pre className="max-h-80 overflow-auto rounded-lg border border-brand-100 bg-white p-3 text-xs text-ink">
{JSON.stringify(result.sampleProduct, null, 2)}
            </pre>
          </div>
          {result.documentTypes?.length > 0 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink-soft">
                Tipos de documento (usa el id de "Boleta electrónica", codeSii 39, para BSALE_DOCUMENT_TYPE_ID):
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg border border-brand-100 bg-white p-3 text-xs text-ink">
{JSON.stringify(result.documentTypes, null, 2)}
              </pre>
            </div>
          )}
          {result.priceLists?.length > 0 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink-soft">Listas de precio:</p>
              <pre className="overflow-auto rounded-lg border border-brand-100 bg-white p-3 text-xs text-ink">
{JSON.stringify(result.priceLists, null, 2)}
              </pre>
            </div>
          )}
          {result.offices?.length > 0 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink-soft">Sucursales:</p>
              <pre className="overflow-auto rounded-lg border border-brand-100 bg-white p-3 text-xs text-ink">
{JSON.stringify(result.offices, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
