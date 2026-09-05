-- 26: Programa de referidos simple.
--
-- Sin tabla de códigos aparte: el enlace de invitación de cada usuario usa
-- directamente su propio `user_id` como código (`/registro?ref=<user_id>`),
-- así que esta tabla solo necesita registrar quién invitó a quién. Cada
-- persona invitada cuenta una única vez (`referido_id` es `unique`), así que
-- da igual si visita el enlace varias veces o si se registra por otra vía
-- después de haberlo abierto una vez.

create table referidos (
  id uuid primary key default gen_random_uuid(),
  referidor_id uuid not null references auth.users(id) on delete cascade,
  referido_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz not null default now(),
  check (referidor_id <> referido_id)
);

create index referidos_referidor_id_idx on referidos (referidor_id);

alter table referidos enable row level security;

-- Cada usuario ve solo a quién ha invitado él mismo.
create policy "referidos_select_own" on referidos
  for select using (auth.uid() = referidor_id);

-- La persona invitada es quien inserta la fila (al completar su propio
-- registro), no el referidor — de ahí que el check sea sobre `referido_id`.
create policy "referidos_insert_own" on referidos
  for insert with check (auth.uid() = referido_id);
