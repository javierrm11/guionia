-- MoleroDev — Panel de Administración
-- 06: Guiones por escenas (estructuras reutilizables + escenas por guion)

create type tipo_escena_enum as enum ('hook', 'desarrollo', 'cta');

create table escenas_guion (
  id uuid primary key default gen_random_uuid(),
  pieza_id uuid not null references piezas_contenido(id) on delete cascade,
  orden int not null,
  tipo_escena tipo_escena_enum not null,
  duracion_segundos int,
  texto text
);

create index escenas_guion_pieza_id_idx on escenas_guion (pieza_id);

create table estructuras_guion (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  nombre text not null,
  duracion_segundos int not null,
  created_at timestamptz not null default now()
);

create index estructuras_guion_plataforma_idx on estructuras_guion (plataforma);

create table estructura_escenas (
  id uuid primary key default gen_random_uuid(),
  estructura_id uuid not null references estructuras_guion(id) on delete cascade,
  orden int not null,
  tipo_escena tipo_escena_enum not null,
  duracion_segundos int not null,
  nota text
);

create index estructura_escenas_estructura_id_idx on estructura_escenas (estructura_id);
