-- Guionia
-- 14: Series de contenido (piezas relacionadas, ej. parte 1/2/3 de un tema)

alter table piezas_contenido add column serie text;
alter table piezas_contenido add column serie_parte int;
