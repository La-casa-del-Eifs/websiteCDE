-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN 002 · Roles ampliados + datos de registro
--  Ejecuta este script en Supabase > SQL Editor (una sola vez).
--  Seguro de correr sobre una base que ya tiene schema.sql aplicado.
-- ════════════════════════════════════════════════════════════════

-- 1) Nuevos roles
alter type user_role add value if not exists 'vendedor';
alter type user_role add value if not exists 'empresa';

-- 2) Nuevas columnas en profiles
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists apellido_paterno text;
alter table public.profiles add column if not exists apellido_materno text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists rut text;
alter table public.profiles add column if not exists discount_percent numeric(5,2) not null default 0;

-- 3) Rol por defecto al registrarse: cliente
alter table public.profiles alter column role set default 'cliente';

-- 4) Trigger de creación de perfil: guarda nombres, apellidos y RUT
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

-- 5) Seguridad: un usuario NO puede cambiarse el rol ni el descuento a sí mismo.
--    Solo un admin puede modificar esos campos.
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
