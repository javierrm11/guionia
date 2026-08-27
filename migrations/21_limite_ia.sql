-- 21: Límite de uso de la generación de guiones con IA — sin esto,
-- generarEscenaConIA no tenía ningún tope: cualquier cuenta autenticada
-- podía llamarla en bucle y disparar el coste de la API de Gemini sin
-- control. Tabla nueva, sin datos previos, RLS activada desde ya (mismo
-- patrón que youtube_conexiones/tiktok_conexiones).
--
-- Solo es un registro de "cuándo generé algo" — lo mínimo para poder contar
-- cuántas veces ha generado un usuario en la última ventana de tiempo.

create table generaciones_ia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create index generaciones_ia_user_id_created_at_idx on generaciones_ia (user_id, created_at);

alter table generaciones_ia enable row level security;

create policy "generaciones_ia_select_own" on generaciones_ia
  for select using (auth.uid() = user_id);

create policy "generaciones_ia_insert_own" on generaciones_ia
  for insert with check (auth.uid() = user_id);

-- Permite que la propia acción limpie su historial fuera de la ventana
-- vigente (autolimpieza, sin necesidad de un cron aparte). No hay política
-- de update — no hace falta y así nadie puede "editar" su propio historial.
create policy "generaciones_ia_delete_own" on generaciones_ia
  for delete using (auth.uid() = user_id);
