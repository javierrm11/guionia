-- 24: Plantillas de guion predefinidas por nicho, para clonar como punto de
-- partida al crear un guion nuevo.
--
-- Reutiliza estructuras_guion/estructura_escenas (ya son "plantillas de
-- escenas reutilizables") en vez de montar tablas nuevas — la única
-- diferencia es que estas filas no pertenecen a ningún usuario en concreto
-- (es_plantilla_sistema = true) y son visibles para todos, mientras que el
-- resto de estructuras (las que crea cada usuario) siguen viéndose solo por
-- su dueño, como hasta ahora.

alter table estructuras_guion add column if not exists es_plantilla_sistema boolean not null default false;
alter table estructuras_guion add column if not exists nicho text;
alter table estructuras_guion alter column user_id drop not null;

alter table estructura_escenas add column if not exists es_plantilla_sistema boolean not null default false;
alter table estructura_escenas alter column user_id drop not null;

-- Las plantillas de sistema se ven siempre; el resto de filas, solo su dueño.
drop policy if exists "estructuras_guion_select_own" on estructuras_guion;
create policy "estructuras_guion_select_own" on estructuras_guion
  for select using (es_plantilla_sistema or auth.uid() = user_id);

drop policy if exists "estructura_escenas_select_own" on estructura_escenas;
create policy "estructura_escenas_select_own" on estructura_escenas
  for select using (es_plantilla_sistema or auth.uid() = user_id);

-- Nadie inserta/edita/borra una plantilla de sistema desde la app (el código
-- nunca expone ese campo) — se refuerza aquí también, a nivel de base de datos.
drop policy if exists "estructuras_guion_insert_own" on estructuras_guion;
create policy "estructuras_guion_insert_own" on estructuras_guion
  for insert with check (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "estructura_escenas_insert_own" on estructura_escenas;
create policy "estructura_escenas_insert_own" on estructura_escenas
  for insert with check (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "estructuras_guion_update_own" on estructuras_guion;
create policy "estructuras_guion_update_own" on estructuras_guion
  for update using (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "estructura_escenas_update_own" on estructura_escenas;
create policy "estructura_escenas_update_own" on estructura_escenas
  for update using (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "estructuras_guion_delete_own" on estructuras_guion;
create policy "estructuras_guion_delete_own" on estructuras_guion
  for delete using (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "estructura_escenas_delete_own" on estructura_escenas;
create policy "estructura_escenas_delete_own" on estructura_escenas
  for delete using (auth.uid() = user_id and not es_plantilla_sistema);

-- ─────────────────────────────────────────────
-- Plantillas por nicho (TikTok — punto de partida, se pueden clonar y
-- reajustar a cualquier duración/plataforma después).
-- ─────────────────────────────────────────────

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Rutina rápida', 30, true, 'Fitness')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Plantea el problema: "¿Sin tiempo para entrenar?"', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 20, 'Muestra la rutina paso a paso, sin cortes largos', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Invita a guardar el vídeo para hacerla más tarde', true from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Consejo de dinero', 30, true, 'Finanzas personales')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Rompe un mito común sobre el dinero', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 20, 'Explica el consejo con un ejemplo numérico concreto', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Pregunta su situación en comentarios', true from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Tutorial de belleza', 30, true, 'Belleza y moda')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Enseña el "antes" o plantea el problema de belleza', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 20, 'Pasos del tutorial, uno por plano', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Etiqueta los productos e invita a guardar', true from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Sketch corto', 15, true, 'Humor')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Plantea la situación absurda o relatable', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 7, 'El remate/gag', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 3, 'Invita a compartir con quien le pase esto', true from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Dato que no sabías', 30, true, 'Educativo')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Pregunta intrigante que abre curiosidad', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 20, 'Explica el dato con contexto y una fuente', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Invita a seguir para más datos así', true from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema, nicho)
  values ('tiktok', 'Lección de negocio', 45, true, 'Emprendimiento')
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Un error común o un mito de emprender', true from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 35, 'La lección, con un ejemplo real o una cifra concreta', true from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Invita a contar su experiencia en comentarios', true from nueva;
