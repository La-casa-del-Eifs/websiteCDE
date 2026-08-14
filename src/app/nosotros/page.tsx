import Link from "next/link";
import type { Metadata } from "next";
import {
  Target,
  Eye,
  HeartHandshake,
  Layers,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { getTeamMembers } from "@/lib/data/team";
import { getSiteImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce La Casa del Eifs: especialistas en sistemas EIFS para fachadas, con productos de calidad y asesoría profesional.",
};

const values = [
  {
    icon: Target,
    title: "Misión",
    text: "Proveer sistemas EIFS de calidad y asesoría experta para que cada fachada sea eficiente, durable y estéticamente superior.",
  },
  {
    icon: Eye,
    title: "Visión",
    text: "Ser el referente en soluciones EIFS, reconocidos por la confiabilidad de nuestros productos y el acompañamiento a cada proyecto.",
  },
  {
    icon: HeartHandshake,
    title: "Valores",
    text: "Calidad, cercanía con el cliente, cumplimiento y compromiso técnico en cada entrega.",
  },
];

const reasons = [
  "Amplio catálogo de molduras, cornisas, marcos y acabados.",
  "Materiales de aislación térmica de alto rendimiento.",
  "Asesoría en especificación técnica del sistema.",
  "Coordinación de despacho para tu obra.",
  "Atención cercana antes, durante y después de la compra.",
];

export const dynamic = "force-dynamic";

export default async function NosotrosPage() {
  const team = await getTeamMembers();
  const eifsImg = await getSiteImage("eifs_diagram");
  return (
    <PublicShell>
      {/* Hero */}
      <section className="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-sand">
        <div className="container-page py-16">
          <span className="badge">Sobre nosotros</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink">
            Especialistas en sistemas EIFS para fachadas
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            En La Casa del Eifs reunimos todo lo necesario para ejecutar un
            sistema EIFS de principio a fin. Trabajamos con constructoras,
            arquitectos, ferreterías y particulares, ofreciendo productos
            confiables y asesoría técnica real.
          </p>
        </div>
      </section>

      {/* ¿Qué es EIFS? */}
      <section className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="card overflow-hidden">
          {eifsImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eifsImg}
              alt="Sistema EIFS"
              className="aspect-[5/4] w-full object-cover"
            />
          ) : (
            <div className="relative flex aspect-[5/4] items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-gold-50">
              <div className="flex flex-col items-center gap-3 text-brand-700">
                <Layers size={64} strokeWidth={1.2} />
                <p className="text-sm font-semibold uppercase tracking-widest">
                  Capas del sistema EIFS
                </p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">¿Qué es EIFS?</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            EIFS (Exterior Insulation and Finish System) es un sistema de
            aislación y terminación exterior que se instala sobre la fachada. Se
            compone de placas de poliestireno, adhesivos, malla de refuerzo, base
            coat y un acabado texturado. El resultado: mayor aislación térmica,
            impermeabilidad y una estética arquitectónica con molduras y relieves.
          </p>
          <Link href="/catalogo" className="btn-primary mt-6">
            Ver productos <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Misión / Visión / Valores */}
      <section className="container-page py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-brand-900">
                <v.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="container-page py-16">
        <div className="card grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-2xl font-bold text-ink">
              ¿Por qué elegir La Casa del Eifs?
            </h2>
            <p className="mt-3 text-ink-soft">
              Combinamos producto, conocimiento técnico y servicio para que tu
              proyecto salga bien a la primera.
            </p>
          </div>
          <ul className="space-y-3">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-brand-600"
                />
                <span className="text-ink-soft">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {team.length > 0 && (
        <section className="container-page py-16">
          <div className="text-center">
            <span className="badge">Nuestro equipo</span>
            <h2 className="mt-4 text-2xl font-bold text-ink">
              Las personas detrás de La Casa del Eifs
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.id} className="card p-5 text-center">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-brand-50">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-300">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-ink">{m.name}</h3>
                {m.role && <p className="text-sm text-brand-600">{m.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
