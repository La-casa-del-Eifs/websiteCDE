import { AlertTriangle } from "lucide-react";

// Se muestra cuando Supabase aún no está configurado y se intenta usar auth.
export default function NotConfigured() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-brand-700">
        <AlertTriangle size={20} />
        <h2 className="font-semibold">Autenticación no configurada</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Para habilitar el inicio de sesión, registro, usuarios y KPIs reales,
        conecta tu proyecto de Supabase:
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
        <li>Crea un proyecto en supabase.com</li>
        <li>
          Copia <code className="rounded bg-brand-50 px-1">.env.local.example</code>{" "}
          a <code className="rounded bg-brand-50 px-1">.env.local</code> y pega
          tus claves
        </li>
        <li>
          Ejecuta <code className="rounded bg-brand-50 px-1">supabase/schema.sql</code>{" "}
          en el SQL Editor
        </li>
        <li>Reinicia el servidor</li>
      </ol>
      <p className="mt-3 text-xs text-ink-muted">
        Encuentra el paso a paso en el archivo README del proyecto.
      </p>
    </div>
  );
}
