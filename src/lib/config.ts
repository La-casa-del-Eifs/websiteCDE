// Detecta si Supabase está configurado con variables de entorno reales.
// Mientras no lo esté, el sitio funciona con datos de ejemplo (modo demo).

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("TU-PROYECTO") &&
      url.startsWith("http") &&
      key.length > 20
  );
}

export const SITE = {
  name: "Ferretería La Casa del Eifs",
  tagline: "Sistemas EIFS para fachadas que perduran",

  // ── Puedes agregar VARIOS: solo añade líneas separadas por coma ──
  emails: [
    "administracionyventas@casadeleifs.cl",
    "avaldivia@casadeleifs.cl",
    "moya.eliceo@casadeleifs.cl",
  ],
  phones: [
    "+56 9 8190 3925",
    "+56 9 86265467",
  ],
  addresses: [
    "Calle 23 oriente 1655, Nueva Holanda, Talca, Chile",
    "Pasaje 12 sur b 1528, Población Daniel Rebolledo 335, Talca, Chile",
  ],

  // WhatsApp: solo números con código de país, sin + ni espacios.
  whatsapp: "56986265467",
  // Mensaje que aparece precargado al abrir WhatsApp.
  whatsappMessage: "Hola, me gustaría hacer una cotización para mi proyecto",
};
