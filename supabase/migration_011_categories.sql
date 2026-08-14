-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 011 · Categorías del inicio (visibilidad + orden)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.categories add column if not exists featured boolean not null default false;
alter table public.categories add column if not exists sort_order integer not null default 0;
