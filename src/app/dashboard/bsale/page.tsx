import { Info } from "lucide-react";
import type { Metadata } from "next";
import BsaleTester from "@/components/dashboard/BsaleTester";
import BsaleSync from "@/components/dashboard/BsaleSync";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Bsale" };

export default function BsalePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Bsale</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Conexión con Bsale para productos, stock, clientes y facturación.
      </p>
      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Agrega <code className="rounded bg-white px-1">BSALE_ACCESS_TOKEN</code> a tu
          <code className="rounded bg-white px-1">.env.local</code> y reinicia. Luego prueba
          la conexión aquí abajo.
        </p>
      </div>
      <BsaleTester />
      <BsaleSync />
    </div>
  );
}
