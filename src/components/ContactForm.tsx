"use client";

import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/config";

export default function ContactForm({ producto }: { producto?: string }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: producto
      ? `Hola, me interesa el producto: ${producto}. Quisiera solicitar una cotización.`
      : "",
  });

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailtoHref = () => {
    const subject = producto
      ? `Cotización: ${producto}`
      : "Consulta desde el sitio web";
    const body = `Nombre: ${form.nombre}\nEmail: ${form.email}\nTeléfono: ${form.telefono}\n\n${form.mensaje}`;
    return `mailto:${SITE.emails[0]}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const whatsappHref = () => {
    const text = form.mensaje.trim()
      ? `Hola, soy ${form.nombre || "un cliente"}. ${form.mensaje}`
      : SITE.whatsappMessage;
    return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = mailtoHref();
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nombre">
            Nombre *
          </label>
          <input
            id="nombre"
            required
            className="input"
            value={form.nombre}
            onChange={update("nombre")}
            placeholder="Nombre y apellido"
          />
        </div>
        <div>
          <label className="label" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            className="input"
            value={form.telefono}
            onChange={update("telefono")}
            placeholder="+56 9 ..."
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">
          Correo *
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={form.email}
          onChange={update("email")}
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div>
        <label className="label" htmlFor="mensaje">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          required
          rows={5}
          className="input resize-none"
          value={form.mensaje}
          onChange={update("mensaje")}
          placeholder="Cuéntanos qué necesitas..."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">
          <Send size={16} /> Enviar por correo
        </button>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          <MessageCircle size={16} /> Enviar por WhatsApp
        </a>
      </div>
      <p className="text-xs text-ink-muted">
        Al enviar se abrirá tu app de correo o WhatsApp con el mensaje listo.
      </p>
    </form>
  );
}
