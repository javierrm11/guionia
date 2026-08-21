-- 19: guarda el ID real del vídeo de TikTok en la pieza, igual que 17 hizo
-- para YouTube — evita reparsear la URL y detecta duplicados al sincronizar.

alter table piezas_contenido add column tiktok_video_id text;

create index piezas_contenido_tiktok_video_id_idx on piezas_contenido (tiktok_video_id);
