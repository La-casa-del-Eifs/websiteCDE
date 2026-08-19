-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 016 · Enlace opcional por imagen del hero
--  Permite que cada banner del carrusel lleve a un producto/oferta/URL.
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.hero_slides add column if not exists link_url text;
