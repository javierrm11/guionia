-- 29: Vínculo pieza → estructura de guion de origen.
--
-- Igual que `frase_origen_id` en la migración 28: al crear un guion a partir
-- de una estructura, esa relación se perdía (solo se copiaban las escenas ya
-- con su texto). Sin este vínculo no hay forma de saber qué estructura llevó
-- a un vídeo ya publicado, así que no se podía sugerir la estructura que
-- mejor rendimiento real tiene por plataforma (ideas.md #44).
-- `on delete set null`: borrar la estructura original no debe romper el guion.

alter table piezas_contenido
  add column estructura_origen_id uuid references estructuras_guion(id) on delete set null;
