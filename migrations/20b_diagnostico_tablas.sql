-- 20b: Solo diagnóstico — qué tablas existen de verdad en el esquema public,
-- para entender por qué 20a_diagnostico_cuentas.sql no encontró tiktok_conexiones.

select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
