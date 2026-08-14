import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import ClearCartOnMount from "@/components/cart/ClearCartOnMount";
import { getOrderSummary } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/format";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resultado del pago" };

const MAP: Record<
  string,
  { icon: any; color: string; title: string; text: string }
> = {
  ok: {
    icon: CheckCircle2,
    color: "text-green-600",
    title: "¡Pago exitoso!",
    text: "Recibimos tu pago y tu pedido está confirmado. Te contactaremos para coordinar la entrega.",
  },
  rechazado: {
    icon: XCircle,
    color: "text-red-600",
    title: "Pago rechazado",
    text: "Tu pago fue rechazado. Puedes intentar nuevamente o usar otro medio de pago.",
  },
  anulado: {
    icon: AlertTriangle,
    color: "text-amber-500",
    title: "Pago anulado",
    text: "Cancelaste el pago o la sesión expiró. Tu carrito sigue disponible para intentarlo de nuevo.",
  },
  error: {
    icon: AlertTriangle,
    color: "text-amber-500",
    title: "Ocurrió un problema",
    text: "No pudimos confirmar el pago. Si el cargo se realizó, contáctanos y lo revisamos.",
  },
};

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>;
}) {
  const { status = "error", order } = await searchParams;
  const summary = order ? await getOrderSummary(order) : null;
  const info = MAP[status] ?? MAP.error;
  const Icon = info.icon;
  const ok = status === "ok";

  return (
    <PublicShell>
      {ok && <ClearCartOnMount />}
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-10 text-center">
          <Icon size={56} className={`mx-auto ${info.color}`} />
          <h1 className="mt-4 text-2xl font-bold text-ink">{info.title}</h1>
          <p className="mt-3 text-ink-soft">{info.text}</p>
          {order && (
            <p className="mt-3 text-sm text-ink-muted">
              N° de pedido: <span className="font-semibold text-ink">{order}</span>
            </p>
          )}
          {summary?.total != null && (
            <p className="mt-1 text-sm text-ink-muted">
              Total: <span className="font-semibold text-ink">{formatCurrency(Number(summary.total))}</span>
            </p>
          )}
          {summary?.bsale_document_url && (
            <a
              href={summary.bsale_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-4 inline-flex"
            >
              <FileText size={16} /> Ver documento
              {summary.bsale_document_number ? ` N° ${summary.bsale_document_number}` : ""}
            </a>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {ok ? (
              <Link href="/catalogo" className="btn-primary">
                Seguir comprando <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/carrito" className="btn-primary">
                Volver al carrito
              </Link>
            )}
            <Link href="/" className="btn-outline">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
