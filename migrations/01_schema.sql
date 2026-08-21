-- MoleroDev — Panel de Administración
-- 01: Esquema completo (sin RLS — ver 02_rls.sql)

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Tipos
-- ─────────────────────────────────────────────

create type plataforma_enum as enum ('tiktok', 'instagram', 'linkedin', 'youtube');

create type pilar_enum as enum ('educativo', 'build_in_public', 'producto_en_accion', 'opinion');

create type estado_pieza_enum as enum (
  'idea',
  'guion_escrito',
  'grabado',
  'editado',
  'publicado',
  'descartada'
);

create type periodo_enum as enum ('semana', 'mes');

create type tipo_escena_enum as enum ('hook', 'desarrollo', 'cta');

-- ─────────────────────────────────────────────
-- Utilidad: trigger genérico para updated_at
-- ─────────────────────────────────────────────

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────
-- 1. Contenido
-- ─────────────────────────────────────────────

create table piezas_contenido (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  pilar pilar_enum,
  titulo text not null,
  numero int,
  texto text,
  estado estado_pieza_enum not null default 'idea',
  fecha_publicacion date,
  -- Etiquetas libres separadas por comas (ej. "whatsapp, ia, precios")
  etiquetas text,
  -- Metadatos de publicación (TikTok/Instagram: descripción con hashtags;
  -- YouTube: título + descripción + etiquetas; LinkedIn no los usa)
  titulo_publicacion text,
  descripcion_publicacion text,
  etiquetas_publicacion text,
  -- Enlace real al vídeo ya subido a la plataforma (se añade después de publicar)
  url_publicado text,
  -- Series: piezas relacionadas entre sí (ej. "Cómo gané mi primer cliente", parte 1/2/3)
  serie text,
  serie_parte int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger piezas_contenido_set_updated_at
  before update on piezas_contenido
  for each row execute function set_updated_at();

create index piezas_contenido_plataforma_idx on piezas_contenido (plataforma);
create index piezas_contenido_estado_idx on piezas_contenido (estado);
create index piezas_contenido_fecha_publicacion_idx on piezas_contenido (fecha_publicacion);

-- Escenas reales de un guion (cuando se crea a partir de una estructura).
-- Si una pieza no tiene escenas, su guion es el texto libre de `texto`.
create table escenas_guion (
  id uuid primary key default gen_random_uuid(),
  pieza_id uuid not null references piezas_contenido(id) on delete cascade,
  orden int not null,
  tipo_escena tipo_escena_enum not null,
  duracion_segundos int,
  texto text
);

create index escenas_guion_pieza_id_idx on escenas_guion (pieza_id);

-- Historial de versiones anteriores del texto de una escena (al reescribir)
create table escena_versiones (
  id uuid primary key default gen_random_uuid(),
  escena_id uuid not null references escenas_guion(id) on delete cascade,
  texto text not null,
  created_at timestamptz not null default now()
);

create index escena_versiones_escena_id_idx on escena_versiones (escena_id);

-- Banco de frases reutilizables (hooks, CTAs...), por plataforma y tipo de escena
create table frases_guardadas (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  tipo_escena tipo_escena_enum not null,
  texto text not null,
  nota text,
  created_at timestamptz not null default now()
);

create index frases_guardadas_plataforma_idx on frases_guardadas (plataforma);
create index frases_guardadas_tipo_escena_idx on frases_guardadas (tipo_escena);

-- Estructuras de guion reutilizables (plantillas de escenas), por plataforma
create table estructuras_guion (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  nombre text not null,
  duracion_segundos int not null,
  created_at timestamptz not null default now()
);

create index estructuras_guion_plataforma_idx on estructuras_guion (plataforma);

-- Escenas que componen cada estructura (la plantilla en sí)
create table estructura_escenas (
  id uuid primary key default gen_random_uuid(),
  estructura_id uuid not null references estructuras_guion(id) on delete cascade,
  orden int not null,
  tipo_escena tipo_escena_enum not null,
  duracion_segundos int not null,
  nota text
);

create index estructura_escenas_estructura_id_idx on estructura_escenas (estructura_id);

-- Plataformas activas: en cuáles se sube contenido actualmente
create table plataformas_activas (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null unique
);

-- Cadencia fija (ej. "3 TikToks/semana", "2 YouTube/mes")
create table cadencia_contenido (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  cantidad int not null,
  periodo periodo_enum not null,
  nota text
);

-- Plantilla semanal: qué toca publicar cada día
create table plantilla_semanal (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null check (dia_semana between 1 and 7), -- 1 = lunes ... 7 = domingo
  plataforma plataforma_enum,
  nota text not null
);

-- Métricas de contenido: agregado periódico por plataforma
create table metricas_contenido (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  periodo_inicio date not null,
  periodo_fin date not null,
  seguidores_nuevos int not null default 0,
  alcance int not null default 0,
  clics int not null default 0,
  leads int not null default 0,
  created_at timestamptz not null default now(),
  check (periodo_fin >= periodo_inicio)
);

create index metricas_contenido_plataforma_idx on metricas_contenido (plataforma);
create index metricas_contenido_periodo_inicio_idx on metricas_contenido (periodo_inicio);

-- ─────────────────────────────────────────────
-- Datos iniciales: estructuras de guion básicas para TikTok
-- ─────────────────────────────────────────────

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos)
  values ('tiktok', 'Rápido 15s', 15)
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota)
select id, 1, 'hook'::tipo_escena_enum, 3, 'Plantea la pregunta o el problema en una frase' from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 9, 'Da la solución o el dato clave, sin rodeos' from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 3, 'Invita a seguir, comentar o guardar' from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos)
  values ('tiktok', 'Estándar 30s', 30)
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota)
select id, 1, 'hook'::tipo_escena_enum, 3, 'Plantea la pregunta o el problema en una frase' from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 22, 'Desarrolla el tema paso a paso' from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 5, 'Invita a seguir, comentar o guardar' from nueva;

with nueva as (
  insert into estructuras_guion (plataforma, nombre, duracion_segundos)
  values ('tiktok', 'Largo 60s', 60)
  returning id
)
insert into estructura_escenas (estructura_id, orden, tipo_escena, duracion_segundos, nota)
select id, 1, 'hook'::tipo_escena_enum, 5, 'Plantea la pregunta o el problema con más contexto' from nueva
union all
select id, 2, 'desarrollo'::tipo_escena_enum, 45, 'Desarrolla el tema con ejemplos o pasos' from nueva
union all
select id, 3, 'cta'::tipo_escena_enum, 10, 'Invita a seguir, comentar o guardar' from nueva;
