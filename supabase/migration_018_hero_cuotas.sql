-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 018 · Promo de cuotas por banner (armada en código)
--  n° de cuotas + monto → gráfico "HASTA X CUOTAS SIN INTERÉS $monto"
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.hero_slides add column if not exists promo_cuotas integer;
alter table public.hero_slides add column if not exists promo_monto text;
