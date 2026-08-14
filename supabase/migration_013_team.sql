-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 013 · Nuestro equipo (administrable)
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('team', 'team', true)
on conflict (id) do nothing;

drop policy if exists "team_public_read" on storage.objects;
create policy "team_public_read" on storage.objects
  for select using (bucket_id = 'team');
drop policy if exists "team_admin_insert" on storage.objects;
create policy "team_admin_insert" on storage.objects
  for insert with check (bucket_id = 'team' and public.is_admin());
drop policy if exists "team_admin_update" on storage.objects;
create policy "team_admin_update" on storage.objects
  for update using (bucket_id = 'team' and public.is_admin());
drop policy if exists "team_admin_delete" on storage.objects;
create policy "team_admin_delete" on storage.objects
  for delete using (bucket_id = 'team' and public.is_admin());

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  photo_url text,
  photo_path text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.team_members enable row level security;
drop policy if exists "team_members_public_read" on public.team_members;
create policy "team_members_public_read" on public.team_members for select using (true);
drop policy if exists "team_members_admin_all" on public.team_members;
create policy "team_members_admin_all" on public.team_members
  for all using (public.is_admin()) with check (public.is_admin());
