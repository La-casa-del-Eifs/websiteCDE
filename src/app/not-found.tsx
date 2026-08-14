import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-sand px-4 text-center">
      <p className="text-6xl font-bold text-brand-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        La página que buscas no existe o fue movida.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Home size={17} /> Ir al inicio
        </Link>
        <Link href="/catalogo" className="btn-outline">
          <Search size={17} /> Ver catálogo
        </Link>
      </div>
    </div>
  );
}
