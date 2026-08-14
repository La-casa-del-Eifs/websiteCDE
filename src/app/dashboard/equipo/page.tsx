import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTeamMembersAll } from "@/lib/data/team";
import { isSupabaseConfigured } from "@/lib/config";
import TeamManager from "@/components/dashboard/TeamManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Equipo" };

export default async function EquipoPage() {
  const members = await getTeamMembersAll();
  const configured = isSupabaseConfigured();
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Nuestro equipo</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Agrega a tu equipo con foto y cargo. Se muestra en la página <b>Nosotros</b>.
      </p>
      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>Foto recomendada cuadrada (se recorta en círculo). Usa las flechas para ordenar.</p>
      </div>
      <TeamManager initial={members} configured={configured} />
    </div>
  );
}
