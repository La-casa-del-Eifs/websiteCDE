import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/config";
import CategoriesManager from "@/components/dashboard/CategoriesManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · Categorías" };

export default async function CategoriasPage() {
  const categories = await getCategories();
  const configured = isSupabaseConfigured();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Categorías del inicio</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Elige qué categorías se muestran en la página de inicio y en qué orden.
      </p>
      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Las categorías vienen de Bsale. Aquí solo eliges cuáles destacar en el
          inicio; esto no se pierde al re-sincronizar. El catálogo sigue mostrando
          todas para filtrar.
        </p>
      </div>
      <CategoriesManager categories={categories} configured={configured} />
    </div>
  );
}
