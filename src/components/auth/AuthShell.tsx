import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50 to-sand">
      <header className="container-page flex h-16 items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand-700"
        >
          <ArrowLeft size={16} /> Volver al sitio
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
