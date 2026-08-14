import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import NotConfigured from "@/components/auth/NotConfigured";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para gestionar y comprar"
    >
      {isSupabaseConfigured() ? <RegisterForm /> : <NotConfigured />}
    </AuthShell>
  );
}
