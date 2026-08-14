"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateRut, formatRut, cleanRut } from "@/lib/rut";

const initial = {
  first_name: "",
  apellido_paterno: "",
  apellido_materno: "",
  rut: "",
  company: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onRutBlur = () =>
    setForm((f) => ({ ...f, rut: f.rut ? formatRut(f.rut) : "" }));

  const passOk = form.password.length >= 8;
  const matchOk = form.password.length > 0 && form.password === form.confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.first_name.trim() || !form.apellido_paterno.trim()) {
      setError("Ingresa tus nombres y apellido paterno.");
      return;
    }
    if (!validateRut(form.rut)) {
      setError("El RUT no es válido. Revisa el número y el dígito verificador.");
      return;
    }
    if (!form.company.trim()) {
      setError("Ingresa el nombre de la empresa.");
      return;
    }
    if (!passOk) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!matchOk) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const lastName = `${form.apellido_paterno.trim()} ${form.apellido_materno.trim()}`.trim();
      const fullName = `${form.first_name.trim()} ${lastName}`.trim();
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            first_name: form.first_name.trim(),
            apellido_paterno: form.apellido_paterno.trim(),
            apellido_materno: form.apellido_materno.trim(),
            last_name: lastName,
            full_name: fullName,
            rut: cleanRut(form.rut),
            phone: form.phone.trim(),
            company: form.company.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Ocurrió un error. Inténtalo nuevamente.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 size={40} className="mx-auto text-green-600" />
        <h2 className="mt-3 font-semibold text-ink">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Te enviamos un enlace de confirmación a{" "}
          <span className="font-medium">{form.email}</span>. Confírmalo para
          activar tu cuenta.
        </p>
        <Link href="/login" className="btn-primary mt-5 w-full">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className="label" htmlFor="first_name">Nombres *</label>
        <input id="first_name" required className="input"
          value={form.first_name} onChange={update("first_name")}
          placeholder="Nombres" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="apellido_paterno">Apellido paterno *</label>
          <input id="apellido_paterno" required className="input"
            value={form.apellido_paterno} onChange={update("apellido_paterno")}
            placeholder="Apellido paterno" />
        </div>
        <div>
          <label className="label" htmlFor="apellido_materno">Apellido materno</label>
          <input id="apellido_materno" className="input"
            value={form.apellido_materno} onChange={update("apellido_materno")}
            placeholder="Apellido materno" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rut">RUT *</label>
          <input id="rut" required className="input" value={form.rut}
            onChange={update("rut")} onBlur={onRutBlur}
            placeholder="12.345.678-9" inputMode="text" />
        </div>
        <div>
          <label className="label" htmlFor="company">Empresa *</label>
          <input id="company" required className="input" value={form.company}
            onChange={update("company")} placeholder="Nombre de la empresa" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Correo *</label>
          <input id="email" type="email" required className="input"
            value={form.email} onChange={update("email")}
            placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Teléfono</label>
          <input id="phone" className="input" value={form.phone}
            onChange={update("phone")} placeholder="+56 9 ..." />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">Contraseña *</label>
        <div className="relative">
          <input id="password" type={showPass ? "text" : "password"} required
            className="input pr-10" value={form.password}
            onChange={update("password")} placeholder="Mínimo 8 caracteres" />
          <button type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
            aria-label="Mostrar u ocultar contraseña">
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {form.password.length > 0 && (
          <p className={`mt-1 text-xs ${passOk ? "text-green-700" : "text-ink-muted"}`}>
            {passOk ? "✓ Longitud correcta" : "Debe tener al menos 8 caracteres"}
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="confirm">Repetir contraseña *</label>
        <input id="confirm" type={showPass ? "text" : "password"} required
          className="input" value={form.confirm} onChange={update("confirm")}
          placeholder="Repite tu contraseña" />
        {form.confirm.length > 0 && (
          <p className={`mt-1 text-xs ${matchOk ? "text-green-700" : "text-red-600"}`}>
            {matchOk ? "✓ Las contraseñas coinciden" : "Las contraseñas no coinciden"}
          </p>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
        Crear cuenta
      </button>
      <p className="text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
