"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import {
  readConsent,
  saveConsent,
  CONSENT_EVENT,
  OPEN_SETTINGS_EVENT,
  type ConsentValue,
} from "@/lib/consent";

// Aviso de cookies + carga de analítica solo con consentimiento.
export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    setConsent(saved);
    setOpen(saved === null);

    const onChange = (e: Event) => setConsent((e as CustomEvent<ConsentValue>).detail);
    const onOpen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
    };
  }, []);

  const choose = (value: ConsentValue) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <>
      {consent === "all" && <Analytics />}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-md"
        >
          <div className="card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-brand-900">
                <Cookie size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-ink">Usamos cookies</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Usamos cookies necesarias para tu sesión y el carrito. Con tu
                  permiso, también medimos visitas de forma anónima para mejorar el
                  sitio.{" "}
                  <Link href="/cookies" className="font-medium text-brand-600 underline hover:text-brand-700">
                    Política de cookies
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button onClick={() => choose("necessary")} className="btn-outline px-4 py-2">
                Solo necesarias
              </button>
              <button onClick={() => choose("all")} className="btn-primary px-4 py-2">
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
