-- 25: Historial de estados de una pieza — línea de tiempo
-- (idea → guion escrito → grabado → editado → publicado → …).
--
-- Hasta ahora `piezas_contenido.estado` solo guardaba el estado actual;
-- `updated_at` se sobrescribe en cada cambio, así que no había forma de saber
-- cuándo pasó cada transición. Esta tabla es un log de solo-inserción: cada
-- vez que una pieza cambia de estado se añade una fila nueva, nunca se
-- actualiza ni se borra una existente (salvo en cascada si se borra la
-- propia pieza).

create table piezas_historial (
  id uuid primary key default gen_random_uuid(),
  pieza_id uuid not null references piezas_contenido(id) on delete cascade,
  estado estado_pieza_enum not null,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create index piezas_historial_pieza_id_idx on piezas_historial (pieza_id);
create index piezas_historial_user_id_idx on piezas_historial (user_id);

alter table piezas_historial enable row level security;

create policy "piezas_historial_select_own" on piezas_historial
  for select using (auth.uid() = user_id);
create policy "piezas_historial_insert_own" on piezas_historial
  for insert with check (auth.uid() = user_id);

-- Backfill: no se puede reconstruir el historial real de las piezas ya
-- existentes, así que se aproxima con lo que sí se sabe — toda pieza empezó
-- como "idea" en su `created_at`, y si ya avanzó a otro estado, ese estado
-- actual se registra en `updated_at` (la fecha del último cambio guardado).
insert into piezas_historial (pieza_id, estado, user_id, created_at)
select id, 'idea'::estado_pieza_enum, user_id, created_at from piezas_contenido;

insert into piezas_historial (pieza_id, estado, user_id, created_at)
select id, estado, user_id, updated_at from piezas_contenido where estado <> 'idea';
