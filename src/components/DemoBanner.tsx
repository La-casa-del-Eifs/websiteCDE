import { Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";

// Aviso visible solo mientras Supabase no está configurado.
export default function DemoBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="bg-brand-900 text-brand-50">
      <div className="container-page flex items-center gap-2 py-2 text-xs">
        <Info size={14} className="shrink-0" />
        <p>
          <span className="font-semibold">Modo demostración.</span> Estás viendo
          datos de ejemplo. Conecta Supabase (ver README) para usar tu catálogo,
          usuarios y KPIs reales.
        </p>
      </div>
    </div>
  );
}
