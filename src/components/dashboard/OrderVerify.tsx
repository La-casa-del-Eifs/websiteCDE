"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";

export default function OrderVerify({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function verify() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || "No se pudo verificar.");
      } else {
        setMsg(
          data.approved
            ? "Pago confirmado ✓"
            : data.payment_status === "iniciado"
            ? "Sigue pendiente en Webpay."
            : "Pago no aprobado (rechazado/anulado)."
        );
        router.refresh();
      }
    } catch {
      setMsg("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={verify} disabled={loading} className="btn-outline">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        Verificar en Webpay
      </button>
      {msg && <p className="mt-2 text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}
