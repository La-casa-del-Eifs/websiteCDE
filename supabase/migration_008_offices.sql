-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 008 · Sucursales Bsale + sucursal del pedido
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.bsale_offices (
  id bigint primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bsale_offices enable row level security;

drop policy if exists "bsale_offices_public_read" on public.bsale_offices;
create policy "bsale_offices_public_read" on public.bsale_offices
  for select using (true);

drop policy if exists "bsale_offices_admin_all" on public.bsale_offices;
create policy "bsale_offices_admin_all" on public.bsale_offices
  for all using (public.is_admin()) with check (public.is_admin());

-- Sucursal elegida en el pedido (desde donde se descuenta el stock).
alter table public.orders add column if not exists office_id bigint;
