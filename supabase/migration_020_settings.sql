-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 020 · Ajustes del sitio (clave/valor)
--  Primer ajuste: habilitar/deshabilitar despacho a domicilio.
--  Ejecuta en Supabase > SQL Editor. Seguro de re-correr.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);

drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value)
values ('despacho_enabled', 'true')
on conflict (key) do nothing;
