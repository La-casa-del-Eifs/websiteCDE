import type { Metadata } from "next";
import { getDeliveryEnabled } from "@/lib/data/settings";
import { isSupabaseConfigured } from "@/lib/config";
import DeliveryToggle from "@/components/dashboard/DeliveryToggle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Ajustes" };

export default async function AjustesPage() {
  const enabled = await getDeliveryEnabled();
  const configured = isSupabaseConfigured();
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Ajustes</h1>
      <p className="mt-1 text-sm text-ink-soft">Opciones generales de la tienda.</p>
      <DeliveryToggle enabled={enabled} configured={configured} />
    </div>
  );
}
