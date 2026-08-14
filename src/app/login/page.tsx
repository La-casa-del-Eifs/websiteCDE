import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import NotConfigured from "@/components/auth/NotConfigured";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta y al panel de gestión"
    >
      {isSupabaseConfigured() ? (
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      ) : (
        <NotConfigured />
      )}
    </AuthShell>
  );
}
