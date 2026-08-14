"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu, X, LogIn, ShoppingCart, User, LayoutDashboard, LogOut, ChevronDown,
} from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart/CartContext";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { count, hydrated } = useCart();
  const { user } = useSupabaseUser();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const firstName =
    (user?.user_metadata?.first_name as string) ||
    user?.email?.split("@")[0] ||
    "Mi cuenta";

  async function logout() {
    setUserMenu(false);
    setOpen(false);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  const CartLink = ({ className = "" }: { className?: string }) => (
    <Link
      href="/carrito"
      className={`relative rounded-lg p-2 text-ink-soft transition hover:bg-brand-50 hover:text-brand-800 ${className}`}
      aria-label="Carrito de compras"
    >
      <ShoppingCart size={20} />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-brand-900">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-sand/85 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo priority />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-brand-100 text-brand-900"
                  : "text-ink-soft hover:bg-brand-50 hover:text-brand-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <CartLink className="ml-1" />

          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <User size={15} />
                </span>
                <span className="max-w-[110px] truncate">{firstName}</span>
                <ChevronDown size={15} />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-brand-100 bg-white py-1 shadow-soft">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-800"
                    >
                      <LayoutDashboard size={16} /> Panel
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-800"
                    >
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary ml-1">
              <LogIn size={16} /> Ingresar
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <CartLink />
          <button
            className="rounded-lg p-2 text-ink-soft hover:bg-brand-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-brand-100 bg-sand md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(l.href)
                    ? "bg-brand-100 text-brand-900"
                    : "text-ink-soft hover:bg-brand-50"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg bg-brand-100 px-3 py-2.5 text-sm font-medium text-brand-900"
                >
                  <LayoutDashboard size={16} /> Panel
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-brand-50"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2"
              >
                <LogIn size={16} /> Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
