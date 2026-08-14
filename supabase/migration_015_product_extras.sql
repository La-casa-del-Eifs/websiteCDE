-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 015 · Leyenda, descripción y cartilla técnica (PDF)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
--  Estas columnas NO son tocadas por la sincronización de Bsale.
-- ════════════════════════════════════════════════════════════════

alter table public.products add column if not exists leyenda text;
alter table public.products add column if not exists datasheet_url text;
alter table public.products add column if not exists datasheet_path text;

-- Bucket para las cartillas técnicas (PDF)
insert into storage.buckets (id, name, public)
values ('datasheets', 'datasheets', true)
on conflict (id) do nothing;

drop policy if exists "datasheets_public_read" on storage.objects;
create policy "datasheets_public_read" on storage.objects
  for select using (bucket_id = 'datasheets');
drop policy if exists "datasheets_staff_insert" on storage.objects;
create policy "datasheets_staff_insert" on storage.objects
  for insert with check (bucket_id = 'datasheets' and public.is_staff());
drop policy if exists "datasheets_staff_update" on storage.objects;
create policy "datasheets_staff_update" on storage.objects
  for update using (bucket_id = 'datasheets' and public.is_staff());
drop policy if exists "datasheets_staff_delete" on storage.objects;
create policy "datasheets_staff_delete" on storage.objects
  for delete using (bucket_id = 'datasheets' and public.is_staff());
