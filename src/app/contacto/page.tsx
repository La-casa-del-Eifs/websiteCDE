import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctanos para cotizaciones y asesoría en sistemas EIFS. Correo, teléfono y WhatsApp.",
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const { producto } = await searchParams;

  const items = [
    ...SITE.emails.map((e) => ({ icon: Mail, label: "Correo", value: e, href: `mailto:${e}` })),
    ...SITE.phones.map((p) => ({ icon: Phone, label: "Teléfono", value: p, href: `tel:${p.replace(/\\s/g, "")}` })),
    ...SITE.addresses.map((a) => ({ icon: MapPin, label: "Ubicación", value: a, href: undefined as string | undefined })),
    { icon: Clock, label: "Horario", value: "Lun a Vie · 9:00 – 18:00", href: undefined as string | undefined },
  ];

  return (
    <PublicShell>
      <section className="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-sand">
        <div className="container-page py-14">
          <span className="badge">Contacto</span>
          <h1 className="mt-4 text-4xl font-bold text-ink">Hablemos de tu proyecto</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Escríbenos para cotizaciones, disponibilidad o asesoría técnica.
            Respondemos a la brevedad.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr]">
        {/* Info */}
        <div>
          <h2 className="text-xl font-bold text-ink">Datos de contacto</h2>
          <div className="mt-5 space-y-3">
            {items.map((it, i) => (
              <div key={i} className="card flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <it.icon size={20} />
                </span>
                <div>
                  <p className="text-xs text-ink-muted">{it.label}</p>
                  {it.href ? (
                    <a href={it.href} className="font-medium text-ink hover:text-brand-700">
                      {it.value}
                    </a>
                  ) : (
                    <p className="font-medium text-ink">{it.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div>
          <h2 className="text-xl font-bold text-ink">Envíanos un mensaje</h2>
          {producto && (
            <p className="mt-2 text-sm text-ink-soft">
              Consulta sobre: <span className="font-semibold">{producto}</span>
            </p>
          )}
          <div className="mt-5">
            <ContactForm producto={producto} />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
