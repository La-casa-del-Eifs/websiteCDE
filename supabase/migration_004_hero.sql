-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 004 · Imágenes del hero administrables (Supabase Storage)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

-- 1) Bucket público "hero"
insert into storage.buckets (id, name, public)
values ('hero', 'hero', true)
on conflict (id) do nothing;

-- 2) Políticas del bucket: lectura pública, escritura solo admin
drop policy if exists "hero_public_read" on storage.objects;
create policy "hero_public_read" on storage.objects
  for select using (bucket_id = 'hero');

drop policy if exists "hero_admin_insert" on storage.objects;
create policy "hero_admin_insert" on storage.objects
  for insert with check (bucket_id = 'hero' and public.is_admin());

drop policy if exists "hero_admin_update" on storage.objects;
create policy "hero_admin_update" on storage.objects
  for update using (bucket_id = 'hero' and public.is_admin());

drop policy if exists "hero_admin_delete" on storage.objects;
create policy "hero_admin_delete" on storage.objects
  for delete using (bucket_id = 'hero' and public.is_admin());

-- 3) Tabla que ordena y controla las imágenes del carrusel
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  url text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

drop policy if exists "hero_slides_public_read" on public.hero_slides;
create policy "hero_slides_public_read" on public.hero_slides
  for select using (true);

drop policy if exists "hero_slides_admin_all" on public.hero_slides;
create policy "hero_slides_admin_all" on public.hero_slides
  for all using (public.is_admin()) with check (public.is_admin());

-- Nota: si la creación de políticas sobre storage.objects diera error de
-- permisos, crea el bucket "hero" (público) desde Storage en el panel de
-- Supabase; las políticas de arriba se pueden añadir luego desde Storage > Policies.
