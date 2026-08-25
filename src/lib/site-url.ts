// Devuelve el origen público del sitio (ej. https://casadeleifs.cl) a partir
// del request entrante. Sirve para construir URLs absolutas de retorno (Webpay,
// etc.) que SIEMPRE apunten al dominio real por el que navega el cliente,
// aunque NEXT_PUBLIC_SITE_URL esté mal configurada (p. ej. quedó en localhost).
//
// Orden de prioridad:
//   1) NEXT_PUBLIC_SITE_URL, solo si es un dominio real (se ignora localhost).
//   2) El host real del request (cabeceras que Vercel completa: x-forwarded-*).
//   3) El origen del propio request como último respaldo.
export function siteOrigin(request: Request): string {
  const clean = (s: string) => s.trim().replace(/\/+$/, "");
  const isLocal = (s: string) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(s);

  // 1) Dominio configurado explícitamente (si no es localhost).
  const configured = clean(process.env.NEXT_PUBLIC_SITE_URL || "");
  if (configured && !isLocal(configured)) return configured;

  // 2) Host real desde las cabeceras del request (Vercel las completa).
  const h = request.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  if (host) {
    const proto = h.get("x-forwarded-proto") || (isLocal(host) ? "http" : "https");
    return clean(`${proto}://${host}`);
  }

  // 3) Último respaldo: el origen del propio request.
  try {
    return new URL(request.url).origin;
  } catch {
    return configured || "http://localhost:3000";
  }
}
