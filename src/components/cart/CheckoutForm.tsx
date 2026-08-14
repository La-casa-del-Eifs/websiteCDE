"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Truck, Store, Tag, CreditCard, ArrowRight, Receipt, FileText } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useUserDiscount } from "@/lib/cart/useUserDiscount";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, SITE } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import { validateRut, formatRut, cleanRut } from "@/lib/rut";

type Method = "despacho" | "retiro";

export default function CheckoutForm({
  offices,
}: {
  offices: { id: number; name: string }[];
}) {
  const { items, subtotal, hydrated } = useCart();
  const discount = useUserDiscount();
  const [method, setMethod] = useState<Method>("despacho");
  const [officeId, setOfficeId] = useState<number | "">(offices[0]?.id ?? "");
  const [docType, setDocType] = useState<"boleta" | "factura">("boleta");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    phone: "",
    rut: "",
    address: "",
    comuna: "",
    city: "",
    notes: "",
    razon_social: "",
    factura_rut: "",
    giro: "",
    factura_direccion: "",
    factura_comuna: "",
    factura_email: "",
  });

  const up =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Prefill si hay sesión.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase
          .from("profiles")
          .select("first_name, apellido_paterno, apellido_materno, rut, phone")
          .eq("id", user.id)
          .single();
        if (data) {
          setForm((f) => ({
            ...f,
            first_name: data.first_name || f.first_name,
            apellido_paterno: data.apellido_paterno || f.apellido_paterno,
            apellido_materno: data.apellido_materno || f.apellido_materno,
            rut: data.rut ? formatRut(data.rut) : f.rut,
            phone: data.phone || f.phone,
            email: user.email || f.email,
          }));
        } else if (user.email) {
          setForm((f) => ({ ...f, email: user.email as string }));
        }
      } catch {
        /* noop */
      }
    })();
  }, []);

  const discountAmount = Math.round((subtotal * discount) / 100);
  const shipping = method === "despacho" && subtotal > 0 ? 0 : 0; // se calcula luego
  const total = subtotal - discountAmount + shipping;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.first_name.trim() || !form.apellido_paterno.trim()) {
      setError("Ingresa tus nombres y apellidos.");
      return;
    }
    if (!form.email.trim()) {
      setError("Ingresa tu correo.");
      return;
    }
    if (!validateRut(form.rut)) {
      setError("El RUT no es válido.");
      return;
    }
    if (method === "despacho" && (!form.address.trim() || !form.comuna.trim())) {
      setError("Completa la dirección de despacho.");
      return;
    }
    if (docType === "factura") {
      if (!form.razon_social.trim()) return setError("Ingresa la razón social.");
      if (!validateRut(form.factura_rut)) return setError("El RUT de la empresa no es válido.");
      if (!form.giro.trim()) return setError("Ingresa el giro.");
      if (!form.factura_direccion.trim() || !form.factura_comuna.trim())
        return setError("Completa la dirección comercial.");
      if (!form.factura_email.trim()) return setError("Ingresa el correo para la factura.");
    }
    setPending(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          buyer: {
            first_name: form.first_name.trim(),
            apellido_paterno: form.apellido_paterno.trim(),
            apellido_materno: form.apellido_materno.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            rut: cleanRut(form.rut),
            user_id: userId,
          },
          delivery: {
            method,
            office_id: officeId || null,
            address: form.address.trim(),
            comuna: form.comuna.trim(),
            city: form.city.trim(),
            notes: form.notes.trim(),
          },
          document: {
            doc_type: docType,
            razon_social: form.razon_social.trim(),
            rut: cleanRut(form.factura_rut),
            giro: form.giro.trim(),
            direccion: form.factura_direccion.trim(),
            comuna: form.factura_comuna.trim(),
            email: form.factura_email.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "No se pudo iniciar el pago.");
        setPending(false);
        return;
      }
      // Redirigir a Webpay (envío POST de token_ws).
      const f = document.createElement("form");
      f.method = "POST";
      f.action = data.url;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = data.token;
      f.appendChild(input);
      document.body.appendChild(f);
      f.submit();
    } catch {
      setError("Error de conexión. Inténtalo nuevamente.");
      setPending(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-ink-soft">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="btn-primary mt-4">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Finalizar compra</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Contacto */}
          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink">Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nombres *</label>
                <input required className="input" value={form.first_name} onChange={up("first_name")} placeholder="Nombres" />
              </div>
              <div>
                <label className="label">Apellido paterno *</label>
                <input required className="input" value={form.apellido_paterno} onChange={up("apellido_paterno")} placeholder="Apellido paterno" />
              </div>
              <div>
                <label className="label">Apellido materno</label>
                <input className="input" value={form.apellido_materno} onChange={up("apellido_materno")} placeholder="Apellido materno" />
              </div>
              <div>
                <label className="label">Correo *</label>
                <input type="email" required className="input" value={form.email} onChange={up("email")} placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input" value={form.phone} onChange={up("phone")} placeholder="+56 9 ..." />
              </div>
              <div>
                <label className="label">RUT *</label>
                <input
                  required
                  className="input"
                  value={form.rut}
                  onChange={up("rut")}
                  onBlur={() => setForm((f) => ({ ...f, rut: f.rut ? formatRut(f.rut) : "" }))}
                  placeholder="12.345.678-9"
                />
              </div>
            </div>
          </section>

          {/* Entrega */}
          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink">Entrega</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod("despacho")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  method === "despacho"
                    ? "border-brand-500 bg-brand-50"
                    : "border-brand-200 hover:border-brand-300"
                }`}
              >
                <Truck size={20} className="text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-ink">Despacho</p>
                  <p className="text-xs text-ink-soft">A tu domicilio u obra</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod("retiro")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  method === "retiro"
                    ? "border-brand-500 bg-brand-50"
                    : "border-brand-200 hover:border-brand-300"
                }`}
              >
                <Store size={20} className="text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-ink">Retiro en tienda</p>
                  <p className="text-xs text-ink-soft">{SITE.addresses[0]}</p>
                </div>
              </button>
            </div>

            {offices.length > 0 && (
              <div className="mt-4">
                <label className="label">
                  {method === "retiro" ? "Retira en la sucursal" : "Despachar desde la sucursal"}
                </label>
                <select
                  className="input"
                  value={officeId}
                  onChange={(e) => setOfficeId(Number(e.target.value))}
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {method === "despacho" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Dirección *</label>
                  <input required className="input" value={form.address} onChange={up("address")} placeholder="Calle y número" />
                </div>
                <div>
                  <label className="label">Comuna *</label>
                  <input required className="input" value={form.comuna} onChange={up("comuna")} placeholder="Comuna" />
                </div>
                <div>
                  <label className="label">Ciudad</label>
                  <input className="input" value={form.city} onChange={up("city")} placeholder="Ciudad" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notas (referencias, horario)</label>
                  <textarea className="input resize-none" rows={2} value={form.notes} onChange={up("notes")} />
                </div>
              </div>
            )}
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink">Documento</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDocType("boleta")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  docType === "boleta" ? "border-brand-500 bg-brand-50" : "border-brand-200 hover:border-brand-300"
                }`}
              >
                <Receipt size={20} className="text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-ink">Boleta</p>
                  <p className="text-xs text-ink-soft">Para consumidor final</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDocType("factura")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  docType === "factura" ? "border-brand-500 bg-brand-50" : "border-brand-200 hover:border-brand-300"
                }`}
              >
                <FileText size={20} className="text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-ink">Factura</p>
                  <p className="text-xs text-ink-soft">Para empresas</p>
                </div>
              </button>
            </div>

            {docType === "factura" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Razón social *</label>
                  <input required className="input" value={form.razon_social} onChange={up("razon_social")} placeholder="Razón social" />
                </div>
                <div>
                  <label className="label">RUT empresa *</label>
                  <input required className="input" value={form.factura_rut} onChange={up("factura_rut")}
                    onBlur={() => setForm((f) => ({ ...f, factura_rut: f.factura_rut ? formatRut(f.factura_rut) : "" }))}
                    placeholder="76.086.428-5" />
                </div>
                <div>
                  <label className="label">Giro *</label>
                  <input required className="input" value={form.giro} onChange={up("giro")} placeholder="Giro / actividad" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Dirección comercial *</label>
                  <input required className="input" value={form.factura_direccion} onChange={up("factura_direccion")} placeholder="Calle y número" />
                </div>
                <div>
                  <label className="label">Comuna *</label>
                  <input required className="input" value={form.factura_comuna} onChange={up("factura_comuna")} placeholder="Comuna" />
                </div>
                <div>
                  <label className="label">Correo factura *</label>
                  <input type="email" required className="input" value={form.factura_email} onChange={up("factura_email")} placeholder="facturacion@empresa.cl" />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Resumen + pago */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-ink">Tu pedido</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="text-ink-soft">
                    {i.qty} × {i.name}
                  </span>
                  <span className="font-medium text-ink">
                    {formatCurrency(i.price * i.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-medium">{formatCurrency(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt className="flex items-center gap-1">
                    <Tag size={14} /> Descuento ({discount}%)
                  </dt>
                  <dd className="font-medium">−{formatCurrency(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-100 pt-2">
                <dt className="text-base font-semibold text-ink">Total</dt>
                <dd className="text-base font-bold text-brand-700">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>

            <button type="submit" disabled={pending} className="btn-primary mt-5 w-full">
              <CreditCard size={17} />
              {pending ? "Redirigiendo a Webpay..." : "Pagar con Webpay"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-ink-muted">
              Pago seguro con Webpay <ArrowRight size={12} />
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
