import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getUsers } from "@/lib/data/admin";
import { getPriceLists } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/config";
import UsersManager from "@/components/dashboard/UsersManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Usuarios" };

export default async function UsuariosAdmin() {
  const [users, priceLists] = await Promise.all([getUsers(), getPriceLists()]);
  const configured = isSupabaseConfigured();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Usuarios</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {users.length} usuario{users.length !== 1 ? "s" : ""} con acceso al
        sistema. Edita el rol y el RUT de cada uno.
      </p>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          <b>Roles:</b> Administrador (todo), Vendedor (clientes y productos),
          Cliente (comprador), Usuario (básico) y Empresa (cliente con{" "}
          <b>lista de precio especial</b>, gestionada vía Bsale).
          {!configured && (
            <>
              {" "}
              <span className="font-semibold">
                Estás en modo demostración: la edición se habilita al conectar
                Supabase.
              </span>
            </>
          )}
        </p>
      </div>

      <UsersManager users={users} configured={configured} priceLists={priceLists} />
    </div>
  );
}
