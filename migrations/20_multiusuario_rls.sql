-- 20: Multiusuario, paso 2 — el que quedó pendiente en 15_multiusuario_columna.sql.
--
-- 1) Rellena user_id en las filas que ya existían antes de la 15 (esa
--    migración solo puso `default auth.uid()`, que solo afecta a filas
--    nuevas — las anteriores se quedaron con user_id NULL).
-- 2) Hace user_id obligatorio en las 10 tablas, ahora que no puede quedar
--    ninguna fila sin dueño.
-- 3) Activa RLS con el mismo patrón que ya usan youtube_conexiones (16) y
--    tiktok_conexiones (18): una política por operación, auth.uid() = user_id.
--
-- El backfill del paso 1 asume una única cuenta en auth.users (el caso de
-- esta app hasta ahora) y aborta si encuentra más de una, para no asignar
-- contenido de una persona a otra por error — en ese caso, rellena user_id
-- a mano antes de volver a ejecutar este archivo.

do $$
declare
  v_user_id uuid;
  v_count int;
begin
  select count(*) into v_count from auth.users;

  if v_count <> 1 then
    raise exception
      'Hay % cuentas en auth.users — este backfill automático solo vale para exactamente 1. Rellena user_id a mano en las filas con user_id NULL y vuelve a ejecutar.',
      v_count;
  end if;

  select id into v_user_id from auth.users limit 1;

  update piezas_contenido set user_id = v_user_id where user_id is null;
  update escenas_guion set user_id = v_user_id where user_id is null;
  update escena_versiones set user_id = v_user_id where user_id is null;
  update frases_guardadas set user_id = v_user_id where user_id is null;
  update estructuras_guion set user_id = v_user_id where user_id is null;
  update estructura_escenas set user_id = v_user_id where user_id is null;
  update plataformas_activas set user_id = v_user_id where user_id is null;
  update cadencia_contenido set user_id = v_user_id where user_id is null;
  update plantilla_semanal set user_id = v_user_id where user_id is null;
  update metricas_contenido set user_id = v_user_id where user_id is null;
end $$;

alter table piezas_contenido alter column user_id set not null;
alter table escenas_guion alter column user_id set not null;
alter table escena_versiones alter column user_id set not null;
alter table frases_guardadas alter column user_id set not null;
alter table estructuras_guion alter column user_id set not null;
alter table estructura_escenas alter column user_id set not null;
alter table plataformas_activas alter column user_id set not null;
alter table cadencia_contenido alter column user_id set not null;
alter table plantilla_semanal alter column user_id set not null;
alter table metricas_contenido alter column user_id set not null;

alter table piezas_contenido enable row level security;
alter table escenas_guion enable row level security;
alter table escena_versiones enable row level security;
alter table frases_guardadas enable row level security;
alter table estructuras_guion enable row level security;
alter table estructura_escenas enable row level security;
alter table plataformas_activas enable row level security;
alter table cadencia_contenido enable row level security;
alter table plantilla_semanal enable row level security;
alter table metricas_contenido enable row level security;

create policy "piezas_contenido_select_own" on piezas_contenido
  for select using (auth.uid() = user_id);
create policy "piezas_contenido_insert_own" on piezas_contenido
  for insert with check (auth.uid() = user_id);
create policy "piezas_contenido_update_own" on piezas_contenido
  for update using (auth.uid() = user_id);
create policy "piezas_contenido_delete_own" on piezas_contenido
  for delete using (auth.uid() = user_id);

create policy "escenas_guion_select_own" on escenas_guion
  for select using (auth.uid() = user_id);
create policy "escenas_guion_insert_own" on escenas_guion
  for insert with check (auth.uid() = user_id);
create policy "escenas_guion_update_own" on escenas_guion
  for update using (auth.uid() = user_id);
create policy "escenas_guion_delete_own" on escenas_guion
  for delete using (auth.uid() = user_id);

create policy "escena_versiones_select_own" on escena_versiones
  for select using (auth.uid() = user_id);
create policy "escena_versiones_insert_own" on escena_versiones
  for insert with check (auth.uid() = user_id);
create policy "escena_versiones_update_own" on escena_versiones
  for update using (auth.uid() = user_id);
create policy "escena_versiones_delete_own" on escena_versiones
  for delete using (auth.uid() = user_id);

create policy "frases_guardadas_select_own" on frases_guardadas
  for select using (auth.uid() = user_id);
create policy "frases_guardadas_insert_own" on frases_guardadas
  for insert with check (auth.uid() = user_id);
create policy "frases_guardadas_update_own" on frases_guardadas
  for update using (auth.uid() = user_id);
create policy "frases_guardadas_delete_own" on frases_guardadas
  for delete using (auth.uid() = user_id);

create policy "estructuras_guion_select_own" on estructuras_guion
  for select using (auth.uid() = user_id);
create policy "estructuras_guion_insert_own" on estructuras_guion
  for insert with check (auth.uid() = user_id);
create policy "estructuras_guion_update_own" on estructuras_guion
  for update using (auth.uid() = user_id);
create policy "estructuras_guion_delete_own" on estructuras_guion
  for delete using (auth.uid() = user_id);

create policy "estructura_escenas_select_own" on estructura_escenas
  for select using (auth.uid() = user_id);
create policy "estructura_escenas_insert_own" on estructura_escenas
  for insert with check (auth.uid() = user_id);
create policy "estructura_escenas_update_own" on estructura_escenas
  for update using (auth.uid() = user_id);
create policy "estructura_escenas_delete_own" on estructura_escenas
  for delete using (auth.uid() = user_id);

create policy "plataformas_activas_select_own" on plataformas_activas
  for select using (auth.uid() = user_id);
create policy "plataformas_activas_insert_own" on plataformas_activas
  for insert with check (auth.uid() = user_id);
create policy "plataformas_activas_update_own" on plataformas_activas
  for update using (auth.uid() = user_id);
create policy "plataformas_activas_delete_own" on plataformas_activas
  for delete using (auth.uid() = user_id);

create policy "cadencia_contenido_select_own" on cadencia_contenido
  for select using (auth.uid() = user_id);
create policy "cadencia_contenido_insert_own" on cadencia_contenido
  for insert with check (auth.uid() = user_id);
create policy "cadencia_contenido_update_own" on cadencia_contenido
  for update using (auth.uid() = user_id);
create policy "cadencia_contenido_delete_own" on cadencia_contenido
  for delete using (auth.uid() = user_id);

create policy "plantilla_semanal_select_own" on plantilla_semanal
  for select using (auth.uid() = user_id);
create policy "plantilla_semanal_insert_own" on plantilla_semanal
  for insert with check (auth.uid() = user_id);
create policy "plantilla_semanal_update_own" on plantilla_semanal
  for update using (auth.uid() = user_id);
create policy "plantilla_semanal_delete_own" on plantilla_semanal
  for delete using (auth.uid() = user_id);

create policy "metricas_contenido_select_own" on metricas_contenido
  for select using (auth.uid() = user_id);
create policy "metricas_contenido_insert_own" on metricas_contenido
  for insert with check (auth.uid() = user_id);
create policy "metricas_contenido_update_own" on metricas_contenido
  for update using (auth.uid() = user_id);
create policy "metricas_contenido_delete_own" on metricas_contenido
  for delete using (auth.uid() = user_id);
