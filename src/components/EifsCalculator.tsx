"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { EIFS_ITEMS } from "@/lib/eifs";

export default function EifsCalculator() {
  const [m2, setM2] = useState<number | "">("");
  const area = typeof m2 === "number" && m2 > 0 ? m2 : 0;

  return (
    <section className="container-page py-16">
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-brand-900">
            <Calculator size={22} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-ink">Calculadora de rendimiento EIFS</h2>
            <p className="text-sm text-ink-soft">
              Ingresa los m² de tu fachada y calcula cuánto material necesitas.
            </p>
          </div>
        </div>

        <div className="mt-5 max-w-xs">
          <label className="label" htmlFor="m2">Metros cuadrados (m²)</label>
          <input
            id="m2"
            type="number"
            min={0}
            value={m2}
            onChange={(e) => setM2(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ej: 120"
            className="input"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-4 font-medium">Producto</th>
                <th className="px-4 py-2 font-medium">Rendimiento</th>
                <th className="px-4 py-2 text-right font-medium">Necesitas</th>
                <th className="py-2 pl-4"></th>
              </tr>
            </thead>
            <tbody>
              {EIFS_ITEMS.map((it) => {
                const qty = area > 0 ? Math.ceil(area * it.perM2) : 0;
                return (
                  <tr key={it.sku} className="border-b border-brand-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{it.name}</p>
                      <p className="text-xs text-ink-muted">{it.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{it.yieldLabel}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-base font-bold text-brand-700">
                        {area > 0 ? `${qty} ${it.unit}` : "—"}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/catalogo?q=${encodeURIComponent(it.sku)}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          Cálculo referencial (se redondea hacia arriba). Para un presupuesto exacto,
          escríbenos.
        </p>
      </div>
    </section>
  );
}
