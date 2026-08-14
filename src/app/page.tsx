import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Sparkles,
  Truck,
  Layers,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import EifsCalculator from "@/components/EifsCalculator";
import ProductCard from "@/components/ProductCard";
import { getHomeCategories, getFeaturedProducts } from "@/lib/data/catalog";
import { getHeroImages } from "@/lib/hero";
import HeroCarousel from "@/components/HeroCarousel";

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

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(6),
    getHomeCategories(),
  ]);
  const heroImages = await getHeroImages();

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-sand">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #0f2b53 0, #0f2b53 1px, transparent 1px, transparent 22px)",
          }}
        />
        <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge">Sistemas EIFS para fachadas</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              FERRETERÍA LA CASA DEL{" "}
              <span className="rounded-md bg-gold-200/80 px-1.5 text-brand-900">EIFS</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Todo para tu sistema proyecto en un solo lugar: molduras, cornisas,
              marcos, adhesivos, mallas y acabados. Calidad profesional con
              asesoría experta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-accent">
                Ver catálogo <ArrowRight size={17} />
              </Link>
              <Link href="/contacto" className="btn-outline">
                Solicitar cotización
              </Link>
            </div>
          </div>

          <div className="relative">
            <HeroCarousel images={heroImages} />
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl bg-gold-400 px-5 py-3 text-brand-900 shadow-soft sm:block">
              <p className="text-2xl font-bold">+120</p>
              <p className="text-xs text-brand-800">productos en catálogo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-brand-900">
                <b.icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="container-page py-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Categorías</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Explora nuestras líneas de productos EIFS.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block"
          >
            Ver todo →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalogo?categoria=${c.slug}`}
              className="card group flex items-center gap-4 p-5 transition hover:border-brand-300"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
                <Layers size={22} />
              </span>
              <div>
                <h3 className="font-semibold text-ink group-hover:text-brand-700">
                  {c.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
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

      {/* Calculadora de rendimiento EIFS */}
      <EifsCalculator />

      {/* CTA */}
      <section className="container-page pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-8 py-14 text-center text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 24px)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold">¿Tienes un proyecto en mente?</h2>
            <p className="mt-3 text-brand-100">
              Cuéntanos qué necesitas y te ayudamos a especificar el sistema EIFS
              ideal, con presupuesto a tu medida.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/contacto"
                className="btn bg-white text-brand-800 hover:bg-brand-50"
              >
                Contáctanos <ArrowRight size={17} />
              </Link>
              <Link
                href="/catalogo"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
