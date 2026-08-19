-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 017 · Imagen de producto + texto de promo por banner
--  (ej: bolsa de mortero PNG sin fondo + "HASTA 3 CUOTAS $20.000")
--  Aparecen junto con la foto de fondo de ese slide. Opcional.
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.hero_slides add column if not exists overlay_url text;
alter table public.hero_slides add column if not exists overlay_path text;
alter table public.hero_slides add column if not exists overlay_text text;
