-- 20a: Solo diagnóstico (no cambia nada) — para identificar cuál de las
-- cuentas de auth.users es la real, antes de rellenar user_id en el resto.
-- (v2: sin tiktok_conexiones, esa tabla no llegó a crearse en esta base de datos)

select
  u.id,
  u.email,
  u.created_at,
  (select count(*) from youtube_conexiones where user_id = u.id) as youtube_conectado,
  (select count(*) from piezas_contenido where user_id = u.id) as piezas_ya_asignadas
from auth.users u
order by u.created_at;
