-- MoleroDev — Panel de Administración
-- 11: Metadatos de publicación por pieza (TikTok/Instagram: descripción con
-- hashtags; YouTube: título + descripción + etiquetas; LinkedIn no los usa)

alter table piezas_contenido add column titulo_publicacion text;
alter table piezas_contenido add column descripcion_publicacion text;
alter table piezas_contenido add column etiquetas_publicacion text;
