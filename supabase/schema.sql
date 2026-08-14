-- ════════════════════════════════════════════════════════════════
--  LA CASA DEL EIFS · Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecuta este script completo en: Supabase > SQL Editor > New query
-- ════════════════════════════════════════════════════════════════

-- ── Tipos (enums) ───────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'vendedor', 'cliente', 'usuario', 'empresa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_status as enum ('activo', 'prospecto', 'inactivo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pendiente', 'confirmado', 'en_proceso', 'entregado', 'cancelado');
exception when duplicate_object then null; end $$;

-- ── Tabla: profiles (usuarios con rol) ──────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  apellido_paterno text,
  apellido_materno text,
  last_name text,
  full_name text,
  rut text,
  role user_role not null default 'cliente',
  phone text,
  company text,
  discount_percent numeric(5,2) not null default 0,
  bsale_price_list_id bigint,
  created_at timestamptz not null default now()
);

-- ── Tabla: categories ───────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  bsale_product_type_id bigint,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Tabla: products ─────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null default 0,
  sku text,
  dimensions text,
  image_url text,
  featured boolean not null default false,
  stock integer not null default 0,
  active boolean not null default true,
  bsale_variant_id bigint,
  bsale_product_id bigint,
  created_at timestamptz not null default now()
);

-- ── Tabla: customers (CRM de clientes) ──────────────────────────
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  city text,
  status customer_status not null default 'prospecto',
  notes text,
  bsale_client_id bigint,
  bsale_document_id bigint,
  bsale_document_number text,
  bsale_document_url text,
  bsale_error text,
  doc_type text default 'boleta',
  factura_razon_social text,
  factura_rut text,
  factura_giro text,
  factura_direccion text,
  factura_comuna text,
  factura_email text,
  created_at timestamptz not null default now()
);

-- ── Tablas: orders + order_items (base para e-commerce) ─────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status order_status not null default 'pendiente',
  total numeric(12,2) not null default 0,
  subtotal numeric(12,2),
  buy_order text,
  payment_status text default 'iniciado',
  tbk_token text,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  buyer_rut text,
  delivery_method text,
  office_id bigint,
  address text,
  comuna text,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bsale_offices (
  id bigint primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0
);

-- ── Función auxiliar: ¿el usuario actual es admin? ──────────────
-- SECURITY DEFINER evita recursión en las políticas RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Trigger: crear profile automáticamente al registrarse ───────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, apellido_paterno, apellido_materno, last_name, full_name, rut, phone, company)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'apellido_paterno',
    new.raw_user_meta_data->>'apellido_materno',
    new.raw_user_meta_data->>'last_name',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'rut',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seguridad: solo un admin puede cambiar el rol o el descuento de un perfil.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  if new.discount_percent is distinct from old.discount_percent and not public.is_admin() then
    new.discount_percent := old.discount_percent;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.bsale_offices enable row level security;
drop policy if exists "bsale_offices_public_read" on public.bsale_offices;
create policy "bsale_offices_public_read" on public.bsale_offices for select using (true);
drop policy if exists "bsale_offices_admin_all" on public.bsale_offices;
create policy "bsale_offices_admin_all" on public.bsale_offices for all using (public.is_admin()) with check (public.is_admin());

-- profiles: cada uno ve/edita su perfil; el admin ve/edita todos.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- categories: lectura pública; escritura solo admin.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: lectura pública; escritura solo admin.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- customers: solo usuarios autenticados; escritura solo admin.
drop policy if exists "customers_auth_read" on public.customers;
create policy "customers_auth_read" on public.customers
  for select using (auth.role() = 'authenticated');

drop policy if exists "customers_admin_write" on public.customers;
create policy "customers_admin_write" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: el admin ve todo; el cliente ve las suyas.
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- order_items: siguen el acceso de su orden.
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_admin_write" on public.order_items;
create policy "order_items_admin_write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Listas de precio por empresa (Bsale) ──
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
create policy "bsale_price_lists_admin" on public.bsale_price_lists for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.product_prices (
  product_id uuid not null references public.products(id) on delete cascade,
  price_list_id bigint not null,
  price numeric(12,2) not null default 0,
  primary key (product_id, price_list_id)
);
create index if not exists idx_product_prices_list on public.product_prices(price_list_id);
alter table public.product_prices enable row level security;
drop policy if exists "product_prices_self_read" on public.product_prices;
create policy "product_prices_self_read" on public.product_prices for select using (
  public.is_admin() or price_list_id = (select bsale_price_list_id from public.profiles where id = auth.uid())
);
drop policy if exists "product_prices_admin_write" on public.product_prices;
create policy "product_prices_admin_write" on public.product_prices for all using (public.is_admin()) with check (public.is_admin());

-- ── Índices útiles ──────────────────────────────────────────────
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_featured on public.products(featured);
create unique index if not exists idx_products_bsale_variant on public.products(bsale_variant_id);
create unique index if not exists idx_categories_bsale_type on public.categories(bsale_product_type_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
