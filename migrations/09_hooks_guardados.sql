-- MoleroDev — Panel de Administración
-- 09: Banco de hooks reutilizables, por plataforma

create table hooks_guardados (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null,
  texto text not null,
  nota text,
  created_at timestamptz not null default now()
);

create index hooks_guardados_plataforma_idx on hooks_guardados (plataforma);
