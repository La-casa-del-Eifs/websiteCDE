-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 014 · Imágenes de secciones del sitio (administrable)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;

drop policy if exists "site_public_read" on storage.objects;
create policy "site_public_read" on storage.objects
  for select using (bucket_id = 'site');
drop policy if exists "site_admin_insert" on storage.objects;
create policy "site_admin_insert" on storage.objects
  for insert with check (bucket_id = 'site' and public.is_admin());
drop policy if exists "site_admin_update" on storage.objects;
create policy "site_admin_update" on storage.objects
  for update using (bucket_id = 'site' and public.is_admin());
drop policy if exists "site_admin_delete" on storage.objects;
create policy "site_admin_delete" on storage.objects
  for delete using (bucket_id = 'site' and public.is_admin());

create table if not exists public.site_images (
  key text primary key,
  url text not null,
  path text,
  updated_at timestamptz not null default now()
);
alter table public.site_images enable row level security;
drop policy if exists "site_images_public_read" on public.site_images;
create policy "site_images_public_read" on public.site_images for select using (true);
drop policy if exists "site_images_admin_all" on public.site_images;
create policy "site_images_admin_all" on public.site_images
  for all using (public.is_admin()) with check (public.is_admin());
