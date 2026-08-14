"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Ocurrió un error. Inténtalo nuevamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div>
        <label className="label" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <LogIn size={17} />
        )}
        Ingresar
      </button>
      <p className="text-center text-sm text-ink-soft">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-brand-600 hover:text-brand-700">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
