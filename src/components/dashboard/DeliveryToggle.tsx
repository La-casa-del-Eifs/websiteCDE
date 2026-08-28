"use client";

import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeliveryToggle({
  enabled,
  configured,
}: {
  enabled: boolean;
  configured: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!configured) return;
    const next = !on;
    setOn(next);
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .upsert(
          { key: "despacho_enabled", value: next ? "true" : "false", updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )
        .select("key");
      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error(
          "No se guardó (permisos). Verifica que seas admin y que la migración 020 esté corrida en Supabase."
        );
    } catch (err: any) {
      setOn(!next); // revertir
      setError(err?.message || "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-brand-900">
            <Truck size={20} />
          </span>
          <div>
            <p className="font-semibold text-ink">Despacho a domicilio</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {on
                ? "Activado: en el checkout los clientes pueden elegir despacho o retiro."
                : "Desactivado: en el checkout los clientes solo pueden elegir retiro en tienda."}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={busy || !configured}
          role="switch"
          aria-checked={on}
          aria-label="Habilitar despacho a domicilio"
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
            on ? "bg-brand-600" : "bg-brand-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              on ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {busy && (
        <p className="mt-3 flex items-center gap-1 text-xs text-ink-muted">
          <Loader2 size={12} className="animate-spin" /> Guardando…
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {!configured && (
        <p className="mt-3 text-xs text-ink-muted">
          Conecta Supabase y ejecuta la migración 020 para usar este ajuste.
        </p>
      )}
    </div>
  );
}
