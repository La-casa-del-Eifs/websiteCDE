"use client";

import { openCookieSettings } from "@/lib/consent";

// Vuelve a mostrar el aviso de cookies para cambiar la elección.
export default function CookieSettingsButton({
  className = "",
  label = "Configurar cookies",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {label}
    </button>
  );
}
