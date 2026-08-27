-- 22: Arreglo completo de multiusuario/RLS.
--
-- El historial de migraciones no se aplicó completo en esta base de datos:
-- faltaba tiktok_conexiones (18), seguía existiendo checklist_semanal (debía
-- borrarla la 8), y ninguna tabla tenía RLS realmente activo pese a que
-- varias migraciones (16, 20, 21) lo daban por hecho — de ahí que dos
-- cuentas distintas vieran el mismo contenido.
--
-- Todo este archivo es IDEMPOTENTE: se puede ejecutar más de una vez sin
-- error ni efectos duplicados, por si hay que repetirlo tras un fallo a
-- mitad. Asigna todo el contenido sin dueño a javierdevweb@gmail.com
-- (la cuenta con la que se ha usado la app hasta ahora, confirmada tras
-- 20a_diagnostico_cuentas.sql).

-- ─────────────────────────────────────────────
-- 1. tiktok_conexiones — no existía. Mismo esquema que 18_tiktok_conexiones.sql.
-- ─────────────────────────────────────────────

create table if not exists tiktok_conexiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  open_id text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  create trigger tiktok_conexiones_set_updated_at
    before update on tiktok_conexiones
    for each row execute function set_updated_at();
exception when duplicate_object then null;
end $$;

alter table tiktok_conexiones enable row level security;

drop policy if exists "tiktok_conexiones_select_own" on tiktok_conexiones;
create policy "tiktok_conexiones_select_own" on tiktok_conexiones
  for select using (auth.uid() = user_id);
drop policy if exists "tiktok_conexiones_insert_own" on tiktok_conexiones;
create policy "tiktok_conexiones_insert_own" on tiktok_conexiones
  for insert with check (auth.uid() = user_id);
drop policy if exists "tiktok_conexiones_update_own" on tiktok_conexiones;
create policy "tiktok_conexiones_update_own" on tiktok_conexiones
  for update using (auth.uid() = user_id);
drop policy if exists "tiktok_conexiones_delete_own" on tiktok_conexiones;
create policy "tiktok_conexiones_delete_own" on tiktok_conexiones
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 2. checklist_semanal — muerta desde la migración 8, seguía viva. Fuera.
-- ─────────────────────────────────────────────

drop table if exists checklist_semanal cascade;

-- ─────────────────────────────────────────────
-- 3. youtube_conexiones y generaciones_ia — reafirma RLS por si acaso
--    (el badge "Unrestricted" de Supabase sugiere que nunca se aplicó
--    de verdad, pese a que sus migraciones lo incluían).
-- ─────────────────────────────────────────────

alter table youtube_conexiones enable row level security;
drop policy if exists "youtube_conexiones_select_own" on youtube_conexiones;
create policy "youtube_conexiones_select_own" on youtube_conexiones
  for select using (auth.uid() = user_id);
drop policy if exists "youtube_conexiones_insert_own" on youtube_conexiones;
create policy "youtube_conexiones_insert_own" on youtube_conexiones
  for insert with check (auth.uid() = user_id);
drop policy if exists "youtube_conexiones_update_own" on youtube_conexiones;
create policy "youtube_conexiones_update_own" on youtube_conexiones
  for update using (auth.uid() = user_id);
drop policy if exists "youtube_conexiones_delete_own" on youtube_conexiones;
create policy "youtube_conexiones_delete_own" on youtube_conexiones
  for delete using (auth.uid() = user_id);

alter table generaciones_ia enable row level security;
drop policy if exists "generaciones_ia_select_own" on generaciones_ia;
create policy "generaciones_ia_select_own" on generaciones_ia
  for select using (auth.uid() = user_id);
drop policy if exists "generaciones_ia_insert_own" on generaciones_ia;
create policy "generaciones_ia_insert_own" on generaciones_ia
  for insert with check (auth.uid() = user_id);
drop policy if exists "generaciones_ia_delete_own" on generaciones_ia;
create policy "generaciones_ia_delete_own" on generaciones_ia
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 4. Las 10 tablas de contenido original: columna user_id (si falta),
--    backfill a tu cuenta, NOT NULL, RLS y las 4 políticas — para las 10 a
--    la vez con un bucle, en vez de repetir el mismo bloque diez veces.
-- ─────────────────────────────────────────────

do $$
declare
  v_user_id uuid := 'b582a7e9-fda0-4dbe-9c3d-a86743275614'; -- javierdevweb@gmail.com
  v_tabla text;
  v_tablas text[] := array[
    'piezas_contenido', 'escenas_guion', 'escena_versiones', 'frases_guardadas',
    'estructuras_guion', 'estructura_escenas', 'plataformas_activas',
    'cadencia_contenido', 'plantilla_semanal', 'metricas_contenido'
  ];
begin
  foreach v_tabla in array v_tablas loop
    execute format(
      'alter table %I add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid()',
      v_tabla
    );
    execute format('update %I set user_id = %L where user_id is null', v_tabla, v_user_id);
    execute format('alter table %I alter column user_id set not null', v_tabla);
    execute format('create index if not exists %I on %I (user_id)', v_tabla || '_user_id_idx', v_tabla);
    execute format('alter table %I enable row level security', v_tabla);

    execute format('drop policy if exists %I on %I', v_tabla || '_select_own', v_tabla);
    execute format(
      'create policy %I on %I for select using (auth.uid() = user_id)',
      v_tabla || '_select_own', v_tabla
    );

    execute format('drop policy if exists %I on %I', v_tabla || '_insert_own', v_tabla);
    execute format(
      'create policy %I on %I for insert with check (auth.uid() = user_id)',
      v_tabla || '_insert_own', v_tabla
    );

    execute format('drop policy if exists %I on %I', v_tabla || '_update_own', v_tabla);
    execute format(
      'create policy %I on %I for update using (auth.uid() = user_id)',
      v_tabla || '_update_own', v_tabla
    );

    execute format('drop policy if exists %I on %I', v_tabla || '_delete_own', v_tabla);
    execute format(
      'create policy %I on %I for delete using (auth.uid() = user_id)',
      v_tabla || '_delete_own', v_tabla
    );
  end loop;
end $$;

-- ─────────────────────────────────────────────
-- 5. plataformas_activas tenía "plataforma" como unique global; con
--    multiusuario cada cuenta necesita poder activar las mismas plataformas
--    que otra. Caso especial fuera del bucle (no es user_id, es un constraint).
-- ─────────────────────────────────────────────

do $$
begin
  alter table plataformas_activas drop constraint if exists plataformas_activas_plataforma_key;
exception when others then null;
end $$;

do $$
begin
  alter table plataformas_activas
    add constraint plataformas_activas_user_plataforma_key unique (user_id, plataforma);
exception when duplicate_object or duplicate_table then null;
end $$;
