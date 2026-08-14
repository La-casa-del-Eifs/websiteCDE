-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 007 · Facturación Bsale en pedidos
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.orders add column if not exists bsale_client_id bigint;
alter table public.orders add column if not exists bsale_document_id bigint;
alter table public.orders add column if not exists bsale_document_number text;
alter table public.orders add column if not exists bsale_document_url text;
alter table public.orders add column if not exists bsale_error text;
