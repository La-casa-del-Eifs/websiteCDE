-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 009 · Boleta/Factura en el pedido
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.orders add column if not exists doc_type text default 'boleta';
alter table public.orders add column if not exists factura_razon_social text;
alter table public.orders add column if not exists factura_rut text;
alter table public.orders add column if not exists factura_giro text;
alter table public.orders add column if not exists factura_direccion text;
alter table public.orders add column if not exists factura_comuna text;
alter table public.orders add column if not exists factura_email text;
