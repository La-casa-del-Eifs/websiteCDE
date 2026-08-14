"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Package, LayoutGrid, Users, UserCog, Images, Contact, Plug, Home, LogOut, Menu, X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { ROLE_LABELS, type UserRole } from "@/types/database";

export default function Sidebar({
  role, userName,
}: {
  role: UserRole; userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const staff: UserRole[] = ["admin", "vendedor"];
  const links = [
    { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, roles: ["admin", "vendedor", "cliente", "usuario", "empresa"] as UserRole[] },
    { href: "/dashboard/pedidos", label: "Pedidos", icon: ClipboardList, roles: staff },
    { href: "/dashboard/productos", label: "Productos", icon: Package, roles: staff },
    { href: "/dashboard/categorias", label: "Categorías", icon: LayoutGrid, roles: ["admin"] as UserRole[] },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users, roles: staff },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: UserCog, roles: ["admin"] as UserRole[] },
    { href: "/dashboard/portada", label: "Portada", icon: Images, roles: ["admin"] as UserRole[] },
    { href: "/dashboard/equipo", label: "Equipo", icon: Contact, roles: ["admin"] as UserRole[] },
    { href: "/dashboard/bsale", label: "Bsale", icon: Plug, roles: ["admin"] as UserRole[] },
  ].filter((l) => l.roles.includes(role));

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const roleLabel = ROLE_LABELS[role];

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive(l.href)
              ? "bg-gold-400 text-brand-900"
              : "text-brand-100 hover:bg-brand-800"
          }`}
        >
          <l.icon size={18} />
          {l.label}
        </Link>
      ))}
    </nav>
  );

  const bottom = (
    <div className="space-y-1 border-t border-brand-800 pt-3">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-brand-800"
      >
        <Home size={18} /> Ver sitio
      </Link>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-brand-800"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-brand-800 bg-brand-900 px-4 py-3 text-white lg:hidden">
        <Logo variant="light" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-1.5 hover:bg-brand-800"
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col gap-4 bg-brand-900 p-4 lg:flex">
        <div className="px-1 py-2">
          <Logo variant="light" />
        </div>
        <div className="rounded-lg bg-brand-800/60 px-3 py-2.5">
          <p className="text-xs text-brand-200">Sesión</p>
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
          <span className="mt-1 inline-block rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
            {roleLabel}
          </span>
        </div>
        {nav}
        {bottom}
      </aside>

      {open && (
        <aside className="flex flex-col gap-4 bg-brand-900 p-4 lg:hidden">
          <div className="rounded-lg bg-brand-800/60 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <span className="mt-1 inline-block rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
              {roleLabel}
            </span>
          </div>
          {nav}
          {bottom}
        </aside>
      )}
    </>
  );
}
