-- MoleroDev — Panel de Administración
-- 05: Plataformas activas (elegidas en la pantalla de bienvenida o desde Configuración)

create table plataformas_activas (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_enum not null unique
);
