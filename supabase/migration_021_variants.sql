-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 021 · Variantes de Bsale agrupadas por producto
--  Cada variante sigue siendo una fila en products (precio, stock y
--  boleta por variante). Estas columnas permiten mostrarlas juntas:
--    base_name    → nombre del producto en Bsale (sin la variante)
--    variant_name → nombre de la variante (null si es "Única")
--  Ejecuta en Supabase > SQL Editor y luego sincroniza Bsale.
--  Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.products add column if not exists base_name text;
alter table public.products add column if not exists variant_name text;

create index if not exists idx_products_bsale_product
  on public.products(bsale_product_id);
