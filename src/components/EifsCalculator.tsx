"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, MessageCircle, Mail } from "lucide-react";
import { EIFS_ITEMS, EPS_TYPES } from "@/lib/eifs";
import { SITE } from "@/lib/config";

export default function EifsCalculator() {
  const [m2, setM2] = useState<number | "">("");
  const [epsId, setEpsId] = useState(EPS_TYPES[0].id);
  const area = typeof m2 === "number" && m2 > 0 ? m2 : 0;
  const eps = EPS_TYPES.find((e) => e.id === epsId) ?? EPS_TYPES[0];

  // Filas calculadas: primero el poliestireno elegido, luego el resto.
  const rows = useMemo(() => {
    const poli = {
      sku: eps.sku,
      name: `Poliestireno ${eps.label}`,
      unit: eps.unit,
      yieldLabel: eps.yieldLabel,
      perM2: eps.perM2,
      search: eps.sku || "poliestireno",
    };
    const rest = EIFS_ITEMS.map((it) => ({ ...it, search: it.sku }));
    return [poli, ...rest];
  }, [eps]);

  // Mensaje de cotización con el detalle de materiales.
  const message = useMemo(() => {
    if (area <= 0) return SITE.whatsappMessage;
    const lines = [
      "Hola, me gustaría una cotización con un vendedor para un proyecto EIFS.",
      `Superficie: ${area} m²`,
      "",
      "Materiales estimados:",
      ...rows.map((r) => `• ${r.name}: ${Math.ceil(area * r.perM2)} ${r.unit}`),
    ];
    return lines.join("\n");
  }, [area, rows]);

  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${SITE.emails[0]}?subject=${encodeURIComponent(
    "Solicitud de cotización EIFS"
  )}&body=${encodeURIComponent(message)}`;

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
              Ingresa los m² y el tipo de poliestireno, y calcula cuánto material necesitas.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:max-w-xl">
          <div>
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
          <div>
            <label className="label" htmlFor="eps">Tipo de poliestireno (EPS)</label>
            <select
              id="eps"
              value={epsId}
              onChange={(e) => setEpsId(e.target.value)}
              className="input"
            >
              {EPS_TYPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
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
              {rows.map((it) => {
                const qty = area > 0 ? Math.ceil(area * it.perM2) : 0;
                return (
                  <tr key={it.name} className="border-b border-brand-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{it.name}</p>
                      {it.sku && <p className="text-xs text-ink-muted">{it.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{it.yieldLabel}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-base font-bold text-brand-700">
                        {area > 0 ? `${qty} ${it.unit}` : "—"}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/catalogo?q=${encodeURIComponent(it.search)}`}
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
          solicita una cotización con un vendedor.
        </p>

        {/* Solicitar cotización con un vendedor */}
        <div className="mt-6 rounded-xl bg-brand-50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-ink">¿Necesitas una cotización?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Un vendedor te ayuda. Enviamos tu cálculo{area > 0 ? ` (${area} m², ${eps.label})` : ""} por
            WhatsApp o correo.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#1eb955] focus:ring-[#25D366]"
            >
              <MessageCircle size={18} /> Cotizar por WhatsApp
            </a>
            <a
              href={mailHref}
              className="btn border border-brand-300 bg-white text-brand-800 hover:bg-brand-50 focus:ring-brand-400"
            >
              <Mail size={18} /> Cotizar por correo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
