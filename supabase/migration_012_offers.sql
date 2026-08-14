-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 012 · Precio de oferta por producto
--  (El campo "featured" ya existe para destacar productos.)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.products add column if not exists offer_price numeric(12,2);
