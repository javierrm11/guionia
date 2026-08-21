-- MoleroDev — Panel de Administración
-- 03: El checklist semanal ahora se genera a partir de cadencia_contenido
-- (periodo = 'semana'), no de plantilla_semanal. Las tareas anteriores se
-- descartan porque son datos derivados, se regeneran solas al abrir el panel.

alter table checklist_semanal drop constraint if exists checklist_semanal_plantilla_id_fkey;

truncate table checklist_semanal;

alter table checklist_semanal rename column plantilla_id to cadencia_id;

alter table checklist_semanal
  add constraint checklist_semanal_cadencia_id_fkey
  foreign key (cadencia_id) references cadencia_contenido(id) on delete set null;
