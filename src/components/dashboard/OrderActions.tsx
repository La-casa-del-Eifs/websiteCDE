"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2, FileText, XCircle, Loader2 } from "lucide-react";

type Kind = "verify" | "pay" | "emit" | "cancel" | null;

export default function OrderActions({
  orderId,
  paymentStatus,
  status,
  hasDocument,
}: {
  orderId: string;
  paymentStatus: string;
  status: string;
  hasDocument: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Kind>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const paid = paymentStatus === "pagado";
  const cancelled = status === "cancelado";

  async function run(kind: Exclude<Kind, null>, url: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(kind);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "verify" ? { orderId } : { orderId, action: kind }
        ),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data?.error || "No se pudo completar.");
      else {
        if (kind === "verify") {
          setMsg(
            data.approved
              ? "Pago confirmado ✓"
              : data.payment_status === "iniciado"
              ? "Sigue pendiente en Webpay."
              : "Pago no aprobado (rechazado/anulado)."
          );
        } else if (kind === "pay") setMsg("Marcado como pagado. Emitiendo documento…");
        else if (kind === "emit") setMsg("Documento reemitido (revisa abajo).");
        else if (kind === "cancel") setMsg("Pedido cancelado.");
        router.refresh();
      }
    } catch {
      setMsg("Error de conexión.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      {!paid && !cancelled && (
        <button
          onClick={() => run("verify", "/api/orders/verify")}
          disabled={busy !== null}
          className="btn-outline w-full"
        >
          {busy === "verify" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Verificar en Webpay
        </button>
      )}

      {!paid && (
        <button
          onClick={() =>
            run("pay", "/api/orders/update", "¿Marcar este pedido como PAGADO y emitir la boleta? Úsalo solo si el pago se recibió realmente.")
          }
          disabled={busy !== null}
          className="btn-primary w-full"
        >
          {busy === "pay" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Marcar pagado y emitir boleta
        </button>
      )}

      {paid && !hasDocument && (
        <button
          onClick={() => run("emit", "/api/orders/update")}
          disabled={busy !== null}
          className="btn-outline w-full"
        >
          {busy === "emit" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Reemitir documento
        </button>
      )}

      {!cancelled && (
        <button
          onClick={() =>
            run("cancel", "/api/orders/update", "¿Cancelar este pedido?")
          }
          disabled={busy !== null}
          className="btn-ghost w-full text-red-600 hover:bg-red-50"
        >
          {busy === "cancel" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
          Cancelar pedido
        </button>
      )}

      {msg && <p className="text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}
