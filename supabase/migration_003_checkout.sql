-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 003 · Datos de checkout en pedidos (orders)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

alter table public.orders add column if not exists buy_order text;
alter table public.orders add column if not exists subtotal numeric(12,2);
alter table public.orders add column if not exists payment_status text default 'iniciado';
alter table public.orders add column if not exists tbk_token text;
alter table public.orders add column if not exists buyer_name text;
alter table public.orders add column if not exists buyer_email text;
alter table public.orders add column if not exists buyer_phone text;
alter table public.orders add column if not exists buyer_rut text;
alter table public.orders add column if not exists delivery_method text; -- 'despacho' | 'retiro'
alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists comuna text;
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists notes text;

create unique index if not exists idx_orders_buy_order on public.orders(buy_order) where buy_order is not null;
create index if not exists idx_orders_tbk_token on public.orders(tbk_token);
