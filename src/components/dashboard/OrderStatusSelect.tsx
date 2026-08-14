"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

const STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en_proceso", label: "En proceso" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "status", value }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving || value === current}
        className="btn-primary shrink-0"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        Guardar
      </button>
    </div>
  );
}
