"use client";

import { useState } from "react";
import { Loader2, Check, Save, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type Profile, type UserRole } from "@/types/database";
import { formatDate } from "@/lib/format";
import { validateRut, formatRut, cleanRut } from "@/lib/rut";

const ROLES: UserRole[] = ["admin", "vendedor", "cliente", "usuario", "empresa"];

type Row = Profile & {
  _rut: string;
  _saving: boolean;
  _saved: boolean;
  _error: string | null;
};

export default function UsersManager({
  users,
  configured,
  priceLists,
}: {
  users: Profile[];
  configured: boolean;
  priceLists: { id: number; name: string }[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    users.map((u) => ({
      ...u,
      _rut: u.rut ? formatRut(u.rut) : "",
      _saving: false,
      _saved: false,
      _error: null,
    }))
  );

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const displayName = (u: Profile) =>
    u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";

  async function save(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    if (row._rut.trim() && !validateRut(row._rut)) {
      setRow(id, { _error: "RUT inválido" });
      return;
    }
    setRow(id, { _saving: true, _saved: false, _error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          role: row.role,
          rut: row._rut.trim() ? cleanRut(row._rut) : null,
          bsale_price_list_id:
            row.role === "empresa" ? row.bsale_price_list_id ?? null : null,
        })
        .eq("id", id);
      if (error) throw error;
      setRow(id, { _saving: false, _saved: true, _rut: row._rut.trim() ? formatRut(row._rut) : "" });
      setTimeout(() => setRow(id, { _saved: false }), 2500);
    } catch {
      setRow(id, { _saving: false, _error: "No se pudo guardar" });
    }
  }

  return (
    <div className="card mt-5 overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">RUT</th>
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Lista precio</th>
            <th className="px-4 py-3 font-medium">Alta</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
              <td className="px-4 py-3 font-medium text-ink">{displayName(u)}</td>
              <td className="px-4 py-3">
                <input
                  disabled={!configured}
                  value={u._rut}
                  onChange={(e) => setRow(u.id, { _rut: e.target.value, _error: null })}
                  onBlur={() => setRow(u.id, { _rut: u._rut.trim() ? formatRut(u._rut) : "" })}
                  placeholder="12.345.678-9"
                  className="w-32 rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:bg-brand-50 disabled:opacity-60"
                />
                {u._error === "RUT inválido" && (
                  <p className="mt-0.5 text-[11px] text-red-600">RUT inválido</p>
                )}
              </td>
              <td className="px-4 py-3 text-ink-soft">{u.company || "—"}</td>
              <td className="px-4 py-3">
                <select
                  disabled={!configured}
                  value={u.role}
                  onChange={(e) => setRow(u.id, { role: e.target.value as UserRole })}
                  className="rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                {u.role === "empresa" ? (
                  <select
                    disabled={!configured}
                    value={u.bsale_price_list_id ?? ""}
                    onChange={(e) =>
                      setRow(u.id, {
                        bsale_price_list_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                  >
                    <option value="">Base</option>
                    {priceLists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-ink-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-ink-soft">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3 text-right">
                {configured ? (
                  <button
                    onClick={() => save(u.id)}
                    disabled={u._saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                  >
                    {u._saving ? <Loader2 size={14} className="animate-spin" /> : u._saved ? <Check size={14} /> : u._error ? <AlertCircle size={14} /> : <Save size={14} />}
                    {u._saved ? "Guardado" : "Guardar"}
                  </button>
                ) : (
                  <span className="text-xs text-ink-muted">demo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
