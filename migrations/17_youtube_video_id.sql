-- 17: guarda el ID real del vídeo de YouTube en la pieza (no solo la URL).
-- Sirve para dos cosas: evitar volver a parsear la URL cada vez que se piden
-- estadísticas, y sobre todo, detectar qué vídeos de tu canal YA están
-- importados como pieza al sincronizar (para no duplicarlos).

alter table piezas_contenido add column youtube_video_id text;

create index piezas_contenido_youtube_video_id_idx on piezas_contenido (youtube_video_id);
