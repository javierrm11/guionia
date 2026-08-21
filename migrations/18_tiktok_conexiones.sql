-- 18: Conexión OAuth con TikTok (una por usuario). Mismo patrón que 16
-- (youtube_conexiones): tabla nueva sin datos previos, RLS activada desde ya.

create table tiktok_conexiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  open_id text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tiktok_conexiones_set_updated_at
  before update on tiktok_conexiones
  for each row execute function set_updated_at();

alter table tiktok_conexiones enable row level security;

create policy "tiktok_conexiones_select_own" on tiktok_conexiones
  for select using (auth.uid() = user_id);

create policy "tiktok_conexiones_insert_own" on tiktok_conexiones
  for insert with check (auth.uid() = user_id);

create policy "tiktok_conexiones_update_own" on tiktok_conexiones
  for update using (auth.uid() = user_id);

create policy "tiktok_conexiones_delete_own" on tiktok_conexiones
  for delete using (auth.uid() = user_id);
