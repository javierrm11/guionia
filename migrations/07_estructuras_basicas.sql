-- MoleroDev — Panel de Administración
-- 07: Estructuras de guion básicas para TikTok (Hook / Desarrollo / CTA)

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
