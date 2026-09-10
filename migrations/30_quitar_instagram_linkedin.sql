-- 30: Quitar 'instagram' y 'linkedin' del enum plataforma_enum.
--
-- ⚠️ NO ejecutar sin comprobar antes que no queden filas reales con esos
-- valores — Postgres no deja recrear un enum si alguna columna todavía usa
-- un valor que se va a eliminar. Antes de correr esto, revisa cada tabla:
--
--   select distinct plataforma from piezas_contenido where plataforma in ('instagram','linkedin');
--   select distinct plataforma from cadencia_contenido where plataforma in ('instagram','linkedin');
--   select distinct plataforma from plantilla_semanal where plataforma in ('instagram','linkedin');
--   select distinct plataforma from frases_guardadas where plataforma in ('instagram','linkedin');
--   select distinct plataforma from estructuras_guion where plataforma in ('instagram','linkedin');
--   select plataforma from plataformas_activas where plataforma in ('instagram','linkedin');
--   select distinct plataforma from metricas_contenido where plataforma in ('instagram','linkedin');
--
-- (`metricas_contenido` no lo usa ningún código de la app hoy — es una tabla
-- de una idea de panel de negocio que nunca se llegó a construir. Se incluye
-- aquí solo porque su columna `plataforma` también usa este enum y bloquea
-- poder borrarlo si no se actualiza a la vez.)
--
-- Si alguna devuelve filas, hay que decidir primero qué hacer con ellas
-- (borrarlas o migrarlas a tiktok/youtube a mano) — esta migración no lo
-- hace por ti, para no borrar contenido real sin que lo decidas tú.
--
-- Postgres no admite "alter type ... drop value", así que la única forma es
-- recrear el tipo: se crea uno nuevo, se cambian todas las columnas para
-- que lo usen, y se borra el viejo.

create type plataforma_enum_nuevo as enum ('tiktok', 'youtube');

alter table piezas_contenido
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table cadencia_contenido
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table plantilla_semanal
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table frases_guardadas
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table estructuras_guion
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table plataformas_activas
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;
alter table metricas_contenido
  alter column plataforma type plataforma_enum_nuevo using plataforma::text::plataforma_enum_nuevo;

drop type plataforma_enum;
alter type plataforma_enum_nuevo rename to plataforma_enum;
