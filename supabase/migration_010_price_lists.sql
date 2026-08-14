-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 010 · Listas de precio por empresa (Bsale)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

-- 1) Columna en profiles PRIMERO (la usa la política de product_prices).
alter table public.profiles add column if not exists bsale_price_list_id bigint;

-- 2) Catálogo de listas de precio (para el selector del admin)
create table if not exists public.bsale_price_lists (
  id bigint primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.bsale_price_lists enable row level security;
drop policy if exists "bsale_price_lists_read" on public.bsale_price_lists;
create policy "bsale_price_lists_read" on public.bsale_price_lists for select using (true);
drop policy if exists "bsale_price_lists_admin" on public.bsale_price_lists;
create policy "bsale_price_lists_admin" on public.bsale_price_lists
  for all using (public.is_admin()) with check (public.is_admin());

-- 3) Precio de cada producto en cada lista
create table if not exists public.product_prices (
  product_id uuid not null references public.products(id) on delete cascade,
  price_list_id bigint not null,
  price numeric(12,2) not null default 0,
  primary key (product_id, price_list_id)
);
create index if not exists idx_product_prices_list on public.product_prices(price_list_id);
alter table public.product_prices enable row level security;

-- Lectura: admin, o el usuario cuya empresa tiene esa lista asignada.
drop policy if exists "product_prices_self_read" on public.product_prices;
create policy "product_prices_self_read" on public.product_prices
  for select using (
    public.is_admin()
    or price_list_id = (select bsale_price_list_id from public.profiles where id = auth.uid())
  );
drop policy if exists "product_prices_admin_write" on public.product_prices;
create policy "product_prices_admin_write" on public.product_prices
  for all using (public.is_admin()) with check (public.is_admin());
