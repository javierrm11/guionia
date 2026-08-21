-- MoleroDev — Panel de Administración
-- 10: El banco de hooks se generaliza a "frases guardadas" (hooks, CTAs...),
-- distinguidas por tipo_escena, para reutilizar la misma infraestructura.

alter table hooks_guardados rename to frases_guardadas;

alter table frases_guardadas
  add column tipo_escena tipo_escena_enum not null default 'hook';

alter table frases_guardadas
  alter column tipo_escena drop default;

create index frases_guardadas_tipo_escena_idx on frases_guardadas (tipo_escena);
