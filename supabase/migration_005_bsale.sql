-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 005 · Mapeo con Bsale (productos, variantes, categorías)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.products add column if not exists bsale_variant_id bigint;
alter table public.products add column if not exists bsale_product_id bigint;

-- Índice único NO parcial (necesario para el upsert ON CONFLICT).
-- Postgres permite múltiples NULL en un índice único, así que las filas
-- sin bsale_variant_id no chocan.
drop index if exists idx_products_bsale_variant;
create unique index if not exists idx_products_bsale_variant
  on public.products(bsale_variant_id);

alter table public.categories add column if not exists bsale_product_type_id bigint;

drop index if exists idx_categories_bsale_type;
create unique index if not exists idx_categories_bsale_type
  on public.categories(bsale_product_type_id);
