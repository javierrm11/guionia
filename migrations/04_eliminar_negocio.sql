-- MoleroDev — Panel de Administración
-- 04: Se elimina el módulo de Negocio (pestaña, rutas y tablas).

drop table if exists trabajo_precios;
drop table if exists trabajos;
drop table if exists clientes;
drop table if exists idea_negocio;

drop type if exists estado_trabajo_enum;
drop type if exists tipo_trabajo_enum;
