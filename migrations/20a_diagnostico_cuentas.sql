-- 20a: Solo diagnóstico (no cambia nada) — para identificar cuál de las
-- cuentas de auth.users es la real, antes de rellenar user_id en 20.
--
-- La señal más fiable es youtube_conexiones/tiktok_conexiones: son tablas
-- que ya tenían RLS y user_id desde el principio (migraciones 16 y 18), así
-- que la cuenta con conexiones reales ahí es casi con toda seguridad la
-- que lleva usando la app de verdad.

select
  u.id,
  u.email,
  u.created_at,
  (select count(*) from youtube_conexiones where user_id = u.id) as youtube_conectado,
  (select count(*) from tiktok_conexiones where user_id = u.id) as tiktok_conectado,
  (select count(*) from piezas_contenido where user_id = u.id) as piezas_ya_asignadas
from auth.users u
order by u.created_at;
