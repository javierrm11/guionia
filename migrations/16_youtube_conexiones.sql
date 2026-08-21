-- 16: Conexión OAuth con YouTube (una por usuario).
-- Tabla nueva sin datos previos que migrar, así que lleva RLS activada desde
-- ya (a diferencia del resto de tablas, donde la migración 15 dejó user_id
-- pendiente de backfill) — guarda tokens de acceso, no tiene sentido dejarla
-- abierta ni un momento.

create table youtube_conexiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  canal_id text not null,
  canal_titulo text not null,
  canal_thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger youtube_conexiones_set_updated_at
  before update on youtube_conexiones
  for each row execute function set_updated_at();

alter table youtube_conexiones enable row level security;

create policy "youtube_conexiones_select_own" on youtube_conexiones
  for select using (auth.uid() = user_id);

create policy "youtube_conexiones_insert_own" on youtube_conexiones
  for insert with check (auth.uid() = user_id);

create policy "youtube_conexiones_update_own" on youtube_conexiones
  for update using (auth.uid() = user_id);

create policy "youtube_conexiones_delete_own" on youtube_conexiones
  for delete using (auth.uid() = user_id);
