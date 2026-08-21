-- 15: Multiusuario, paso 1 — añade la columna user_id a todas las tablas de datos.
-- Todavía SIN activar RLS: eso es el paso 2 (16_multiusuario_rls.sql), una vez
-- exista al menos una cuenta registrada a la que asignar los datos actuales.
--
-- default auth.uid() hace que, en cuanto haya sesión, cualquier insert nuevo
-- quede automáticamente ligado al usuario autenticado sin tocar el código.

alter table piezas_contenido add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table escenas_guion add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table escena_versiones add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table frases_guardadas add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table estructuras_guion add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table estructura_escenas add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table plataformas_activas add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table cadencia_contenido add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table plantilla_semanal add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table metricas_contenido add column user_id uuid references auth.users(id) on delete cascade default auth.uid();

create index piezas_contenido_user_id_idx on piezas_contenido (user_id);
create index escenas_guion_user_id_idx on escenas_guion (user_id);
create index escena_versiones_user_id_idx on escena_versiones (user_id);
create index frases_guardadas_user_id_idx on frases_guardadas (user_id);
create index estructuras_guion_user_id_idx on estructuras_guion (user_id);
create index estructura_escenas_user_id_idx on estructura_escenas (user_id);
create index plataformas_activas_user_id_idx on plataformas_activas (user_id);
create index cadencia_contenido_user_id_idx on cadencia_contenido (user_id);
create index plantilla_semanal_user_id_idx on plantilla_semanal (user_id);
create index metricas_contenido_user_id_idx on metricas_contenido (user_id);

-- plataformas_activas tenía "plataforma" como unique global; con multiusuario
-- cada usuario necesita poder activar las mismas plataformas que otros.
alter table plataformas_activas drop constraint plataformas_activas_plataforma_key;
alter table plataformas_activas add constraint plataformas_activas_user_plataforma_key unique (user_id, plataforma);
