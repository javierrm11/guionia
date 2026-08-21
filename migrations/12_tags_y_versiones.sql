-- Guionia
-- 12: Etiquetas libres por pieza + historial de versiones de escenas

alter table piezas_contenido add column etiquetas text;

create table escena_versiones (
  id uuid primary key default gen_random_uuid(),
  escena_id uuid not null references escenas_guion(id) on delete cascade,
  texto text not null,
  created_at timestamptz not null default now()
);

create index escena_versiones_escena_id_idx on escena_versiones (escena_id);
