-- MoleroDev — Panel de Administración
-- 07: Estructuras de guion básicas para TikTok (Hook / Desarrollo / CTA)
--
-- `es_plantilla_sistema = true` (sin `nicho`, así que aparecen agrupadas bajo
-- "General" en /configuracion/estructuras): sin esto, las filas quedarían
-- con `user_id` a null y las políticas de RLS las dejarían invisibles para
-- cualquier cuenta al consultarlas desde la app — igual que ya hacen las
-- plantillas por nicho de `24_plantillas_nicho.sql`, que usan el mismo
-- patrón.
--
-- Nota de orden: esta migración usa columnas (`es_plantilla_sistema`) que en
-- realidad se añadieron después, en `24_plantillas_nicho.sql` — si alguna
-- vez montas la base de datos desde cero siguiendo el orden numérico, corre
-- primero la 24 (o cualquier migración posterior a ella) antes que esta.
-- Como tu base de datos ya existe y ya tiene esas columnas, no afecta a tu caso.

do $$
declare
  nueva_id uuid;
begin
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema)
  values ('tiktok', 'Rápido 15s', 15, true)
  returning id into nueva_id;

  insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
  values
    (nueva_id, 1, 'hook', 3, 'Plantea la pregunta o el problema en una frase', true),
    (nueva_id, 2, 'desarrollo', 9, 'Da la solución o el dato clave, sin rodeos', true),
    (nueva_id, 3, 'cta', 3, 'Invita a seguir, comentar o guardar', true);
end $$;

do $$
declare
  nueva_id uuid;
begin
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema)
  values ('tiktok', 'Estándar 30s', 30, true)
  returning id into nueva_id;

  insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
  values
    (nueva_id, 1, 'hook', 3, 'Plantea la pregunta o el problema en una frase', true),
    (nueva_id, 2, 'desarrollo', 22, 'Desarrolla el tema paso a paso', true),
    (nueva_id, 3, 'cta', 5, 'Invita a seguir, comentar o guardar', true);
end $$;

do $$
declare
  nueva_id uuid;
begin
  insert into estructuras_guion (plataforma, nombre, duracion_segundos, es_plantilla_sistema)
  values ('tiktok', 'Largo 60s', 60, true)
  returning id into nueva_id;

  insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota, es_plantilla_sistema)
  values
    (nueva_id, 1, 'hook', 5, 'Plantea la pregunta o el problema con más contexto', true),
    (nueva_id, 2, 'desarrollo', 45, 'Desarrolla el tema con ejemplos o pasos', true),
    (nueva_id, 3, 'cta', 10, 'Invita a seguir, comentar o guardar', true);
end $$;
