-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 006 · Imágenes de producto (galería administrable)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

-- 1) Bucket público "products"
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2) Función: ¿el usuario es staff (admin o vendedor)?
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'vendedor')
  );
$$;

-- 3) Políticas del bucket: lectura pública, escritura staff
drop policy if exists "products_img_public_read" on storage.objects;
create policy "products_img_public_read" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "products_img_staff_insert" on storage.objects;
create policy "products_img_staff_insert" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_staff());

drop policy if exists "products_img_staff_update" on storage.objects;
create policy "products_img_staff_update" on storage.objects
  for update using (bucket_id = 'products' and public.is_staff());

drop policy if exists "products_img_staff_delete" on storage.objects;
create policy "products_img_staff_delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_staff());

-- 4) Tabla de imágenes
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id);

alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
  for select using (true);

drop policy if exists "product_images_staff_all" on public.product_images;
create policy "product_images_staff_all" on public.product_images
  for all using (public.is_staff()) with check (public.is_staff());

-- 5) Permitir que el staff (no solo admin) actualice image_url del producto
drop policy if exists "products_staff_update" on public.products;
create policy "products_staff_update" on public.products
  for update using (public.is_staff()) with check (public.is_staff());
