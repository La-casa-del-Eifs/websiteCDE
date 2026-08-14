import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import { SITE } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Especialistas en sistemas EIFS para fachadas: molduras, cornisas,
            marcos, adhesivos, mallas y acabados. Calidad y asesoría para tu
            proyecto.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Navegación</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li><Link href="/catalogo" className="hover:text-brand-700">Catálogo</Link></li>
            <li><Link href="/nosotros" className="hover:text-brand-700">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-brand-700">Contacto</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Ingresar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            {SITE.emails.map((e) => (
              <li key={e} className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-brand-500" />
                <a href={`mailto:${e}`} className="hover:text-brand-700">
                  {e}
                </a>
              </li>
            ))}
            {SITE.phones.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-brand-500" />
                <a href={`tel:${p.replace(/\\s/g, "")}`} className="hover:text-brand-700">
                  {p}
                </a>
              </li>
            ))}
            {SITE.addresses.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-100">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
          <p>Sistemas EIFS · Fachadas · Acabados</p>
        </div>
      </div>
    </footer>
  );
}
