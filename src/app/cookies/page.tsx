import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies y tecnologías similares usa el sitio de La Casa del EIFS, para qué sirven y cómo cambiar tu elección.",
};

const UPDATED = "21 de octubre de 2026";

const rows = [
  {
    type: "Necesaria",
    name: "sb-…-auth-token",
    provider: "La Casa del EIFS (Supabase)",
    purpose: "Mantener tu sesión iniciada en tu cuenta y en el panel.",
    duration: "Hasta que cierres sesión",
  },
  {
    type: "Necesaria",
    name: "cde_cart_v1 (almacenamiento local)",
    provider: "La Casa del EIFS",
    purpose: "Recordar los productos que agregaste al carrito.",
    duration: "Hasta que vacíes el carrito o compres",
  },
  {
    type: "Necesaria",
    name: "cde_cookie_consent_v1 (almacenamiento local)",
    provider: "La Casa del EIFS",
    purpose: "Recordar tu elección sobre cookies.",
    duration: "12 meses",
  },
  {
    type: "Analítica",
    name: "Vercel Web Analytics",
    provider: "Vercel Inc.",
    purpose:
      "Contar visitas y páginas vistas de forma agregada para mejorar el sitio. No usa cookies ni crea un perfil tuyo.",
    duration: "Solo si aceptas",
  },
];

const thirdParties = [
  {
    name: "Transbank (Webpay)",
    text: "Al pagar te redirigimos al sitio de Webpay, que usa sus propias cookies para procesar el pago de forma segura.",
  },
  {
    name: "Google Fonts",
    text: "Cargamos la tipografía del sitio desde Google, que recibe tu dirección IP al descargarla.",
  },
  {
    name: "WhatsApp",
    text: "Si haces clic en un botón de WhatsApp, se abre ese servicio con sus propias condiciones.",
  },
];

export default function CookiesPage() {
  return (
    <PublicShell>
      <section className="container-page max-w-4xl py-12 md:py-16">
        <p className="text-sm text-ink-muted">Última actualización: {UPDATED}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Política de cookies</h1>

        <div className="mt-8 space-y-10 text-sm leading-relaxed text-ink-soft sm:text-base">
          <div>
            <h2 className="text-xl font-bold text-ink">¿Qué son las cookies?</h2>
            <p className="mt-3">
              Las cookies y tecnologías similares (como el almacenamiento local del
              navegador) son pequeños archivos que un sitio guarda en tu dispositivo
              para recordar información entre visitas. En {SITE.name} las usamos lo
              mínimo posible y nunca para publicidad.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">¿Qué usamos y para qué?</h2>
            <p className="mt-3">
              Las <strong className="text-ink">necesarias</strong> hacen funcionar el
              sitio (sesión y carrito) y no se pueden desactivar. Las{" "}
              <strong className="text-ink">analíticas</strong> solo se activan si las
              aceptas.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-brand-100 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-brand-50 text-ink">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Proveedor</th>
                    <th className="px-4 py-3 font-semibold">Finalidad</th>
                    <th className="px-4 py-3 font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {rows.map((r) => (
                    <tr key={r.name} className="align-top">
                      <td className="px-4 py-3">
                        <span className="badge">{r.type}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{r.name}</td>
                      <td className="px-4 py-3">{r.provider}</td>
                      <td className="px-4 py-3">{r.purpose}</td>
                      <td className="px-4 py-3">{r.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">Servicios de terceros</h2>
            <ul className="mt-3 space-y-3">
              {thirdParties.map((t) => (
                <li key={t.name}>
                  <strong className="text-ink">{t.name}:</strong> {t.text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">¿Cómo cambiar tu elección?</h2>
            <p className="mt-3">
              Puedes cambiar tu elección cuando quieras desde el botón de abajo o desde
              el enlace «Configurar cookies» al pie de cada página. También puedes
              borrar o bloquear las cookies desde la configuración de tu navegador;
              si bloqueas las necesarias, no podrás iniciar sesión ni usar el carrito.
            </p>
            <CookieSettingsButton className="btn-primary mt-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">Contacto</h2>
            <p className="mt-3">
              Si tienes dudas sobre esta política o sobre tus datos personales,
              escríbenos a{" "}
              <a href={`mailto:${SITE.emails[0]}`} className="font-medium text-brand-600 hover:text-brand-700">
                {SITE.emails[0]}
              </a>{" "}
              o desde nuestra página de{" "}
              <Link href="/contacto" className="font-medium text-brand-600 hover:text-brand-700">
                contacto
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
