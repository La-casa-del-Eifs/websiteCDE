-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 019 · Visibilidad de productos en el catálogo
--  Agrega la columna "hidden": si es true, el producto NO se muestra
--  en el catálogo público (aunque esté activo en Bsale). Se controla
--  desde el Panel → Productos (el ojito). La sincronización de Bsale
--  NO la modifica, así que tus elecciones se conservan al sincronizar.
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.products
  add column if not exists hidden boolean not null default false;

create index if not exists idx_products_hidden on public.products(hidden);
