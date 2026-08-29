-- Papelera: borrado suave (soft delete) para escenas de guion y frases
-- guardadas (hooks/CTAs) — antes era un delete() directo sin vuelta atrás.

alter table escenas_guion add column if not exists deleted_at timestamptz;
alter table frases_guardadas add column if not exists deleted_at timestamptz;
