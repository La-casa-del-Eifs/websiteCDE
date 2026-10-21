import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Sparkles,
  Truck,
  ChevronDown,
  ChevronRight,
  HeartHandshake,
  Award,
  Lightbulb,
  ThumbsUp,
  Handshake,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import EifsCalculator from "@/components/EifsCalculator";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import Reveal from "@/components/Reveal";
import DiamondPattern, { DiamondMark } from "@/components/DiamondPattern";
import {
  getHomeCategories,
  getFeaturedProducts,
  getCategoryCovers,
} from "@/lib/data/catalog";
import { getHeroImages } from "@/lib/hero";
import HeroCarousel from "@/components/HeroCarousel";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: Thermometer,
    title: "Aislación térmica",
    text: "Mejora la eficiencia energética de la vivienda reduciendo pérdidas de calor.",
  },
  {
    icon: Sparkles,
    title: "Estética arquitectónica",
    text: "Molduras y relieves que transforman cualquier fachada con acabados de calidad.",
  },
  {
    icon: ShieldCheck,
    title: "Durabilidad",
    text: "Sistemas resistentes a la intemperie, impermeables y de larga vida útil.",
  },
  {
    icon: Truck,
    title: "Asesoría y despacho",
    text: "Te acompañamos en la especificación y coordinamos la entrega de tu pedido.",
  },
];

const differentiators = [
  {
    icon: HeartHandshake,
    title: "Tu obra primero",
    text: "Que tu fachada quede bien es nuestro principal indicador.",
  },
  {
    icon: Award,
    title: "Calidad sin transar",
    text: "Trabajamos solo con materiales y sistemas probados.",
  },
  {
    icon: Lightbulb,
    title: "Asesoría técnica",
    text: "Te ayudamos a especificar el sistema correcto para tu proyecto.",
  },
  {
    icon: ThumbsUp,
    title: "Recomendaciones honestas",
    text: "Te ofrecemos lo que tu proyecto necesita, ni más ni menos.",
  },
  {
    icon: Handshake,
    title: "Relaciones de largo plazo",
    text: "Del maestro a la constructora, te acompañamos obra tras obra.",
  },
];

function SectionTitle({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <DiamondMark light={light} />
      <h2 className={`mt-3 text-3xl font-bold ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 max-w-xl text-sm ${light ? "text-brand-100" : "text-ink-soft"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [featured, categories, heroImages] = await Promise.all([
    getFeaturedProducts(6),
    getHomeCategories(),
    getHeroImages(),
  ]);
  const covers = await getCategoryCovers(categories.map((c) => c.id));

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900">
        <div className="relative">
          {/* Fondo: carrusel (o navy si no hay imágenes) */}
          <div className="absolute inset-0">
            <HeroCarousel images={heroImages} variant="background" />
          </div>
          {/* Degradado para que el texto se lea sobre la foto */}
          <div className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-r from-brand-950/90 via-brand-950/55 to-brand-950/10" />
          {/* Contenido encima: ocupa toda la pantalla bajo el menú */}
          <div className="container-page relative z-20 flex min-h-[calc(100svh-4rem)] items-center py-16">
            <div className="max-w-xl">
              <span className="badge">Envolventes térmicos para tu proyecto</span>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-5xl">
                FERRETERÍA LA CASA DEL{" "}
                <span className="rounded-md bg-gold-400 px-1.5 text-brand-900">EIFS</span>.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-50 drop-shadow">
                Todo para tu sistema o proyecto en un solo lugar: molduras, cornisas,
                marcos, adhesivos, mallas y acabados. Calidad profesional con
                asesoría experta.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogo" className="btn-accent">
                  Ver catálogo <ArrowRight size={17} />
                </Link>
                <Link
                  href="#contacto"
                  className="btn border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus:ring-white/50"
                >
                  Solicitar cotización
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Franja con eslogan + botón para bajar */}
      <section className="relative bg-gold-400">
        <DiamondPattern id="slogan-diamonds" className="absolute inset-0 h-full w-full text-brand-900/10" />
        <div className="container-page relative py-7 text-center">
          <p className="text-lg text-brand-900 sm:text-2xl">
            No solo vendemos materiales,{" "}
            <span className="font-bold">te ayudamos a construir mejor.</span>
          </p>
        </div>
        <a
          href="#beneficios"
          aria-label="Bajar a la siguiente sección"
          className="absolute left-1/2 top-full flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900 text-gold-400 shadow-soft ring-4 ring-sand transition hover:bg-brand-800"
        >
          <ChevronDown size={24} className="animate-bounce motion-reduce:animate-none" />
        </a>
      </section>

      {/* Beneficios: íconos circulares */}
      <section id="beneficios" className="container-page scroll-mt-20 py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 100} className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-900 text-gold-400 ring-8 ring-gold-100">
                <b.icon size={32} strokeWidth={1.6} />
              </span>
              <h3 className="mt-6 font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-soft">
                {b.text}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categorías: tarjetas con foto y "Ver más" */}
      <section className="container-page py-8">
        <SectionTitle
          title="Nuestros productos"
          subtitle="Explora nuestras líneas de productos EIFS."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const cover = covers[c.id];
            return (
              <Reveal key={c.id} delay={(i % 3) * 100}>
                <Link
                  href={`/catalogo?categoria=${c.slug}`}
                  className="group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl bg-brand-900 p-6 text-center shadow-soft"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <DiamondPattern
                      id={`cat-diamonds-${c.id}`}
                      size={36}
                      className="absolute inset-0 h-full w-full text-white/10 transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/60 to-brand-950/35 transition group-hover:via-brand-950/70" />
                  <div className="relative">
                    <h3 className="text-xl font-bold leading-snug text-white drop-shadow">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="mx-auto mt-2 line-clamp-2 max-w-xs text-sm text-brand-100">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <span className="absolute bottom-5 inline-flex items-center gap-1 text-sm font-semibold text-gold-400 transition group-hover:gap-2">
                    Ver más <ChevronRight size={16} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/catalogo" className="btn-outline">
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Productos destacados</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Promociones especiales
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block"
          >
            Ver catálogo →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ¿Qué nos diferencia? */}
      <section className="relative overflow-hidden bg-brand-950 py-20">
        <DiamondPattern id="diff-diamonds" size={40} className="absolute inset-0 h-full w-full text-white/[0.04]" />
        <div className="container-page relative">
          <SectionTitle
            light
            title="¿Qué nos diferencia?"
            subtitle="La experiencia de quienes usan nuestros productos es lo que más nos importa."
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={i * 100} className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-gold-400 ring-1 ring-white/15">
                  <d.icon size={28} strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-semibold text-white">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-200">{d.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadora de rendimiento EIFS */}
      <EifsCalculator />

      {/* Contacto */}
      <section id="contacto" className="container-page scroll-mt-20 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-12 sm:px-10 md:py-14">
          <DiamondPattern id="contact-diamonds" size={32} className="absolute inset-0 h-full w-full text-white/[0.07]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div className="text-white">
              <DiamondMark light />
              <h2 className="mt-3 text-3xl font-bold">¿Tienes un proyecto en mente?</h2>
              <p className="mt-3 max-w-md text-brand-100">
                Cuéntanos qué necesitas y te ayudamos a especificar el sistema EIFS
                ideal, con presupuesto a tu medida.
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                <li>
                  <a href={`mailto:${SITE.emails[0]}`} className="inline-flex items-center gap-3 hover:text-gold-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-400">
                      <Mail size={16} />
                    </span>
                    {SITE.emails[0]}
                  </a>
                </li>
                <li>
                  <a href={`tel:${SITE.phones[0].replace(/\s/g, "")}`} className="inline-flex items-center gap-3 hover:text-gold-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-400">
                      <Phone size={16} />
                    </span>
                    {SITE.phones[0]}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 hover:text-gold-300"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-400">
                      <MessageCircle size={16} />
                    </span>
                    Escríbenos por WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </div>
        <MapEmbed className="mt-6" />
      </section>
    </PublicShell>
  );
}
