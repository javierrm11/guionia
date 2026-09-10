-- 27: Ocultar vídeos de "Para ti" / "Tendencias".
--
-- Un vídeo descartado ("no me interesa") deja de aparecer en las tendencias
-- de ese usuario a partir de ahí — no se borra nada del lado de YouTube, solo
-- se guarda el `video_id` para filtrarlo en `obtenerVideosParaTi`.

create table tendencias_ocultas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create index tendencias_ocultas_user_id_idx on tendencias_ocultas (user_id);

alter table tendencias_ocultas enable row level security;

create policy "tendencias_ocultas_select_own" on tendencias_ocultas
  for select using (auth.uid() = user_id);

create policy "tendencias_ocultas_insert_own" on tendencias_ocultas
  for insert with check (auth.uid() = user_id);

create policy "tendencias_ocultas_delete_own" on tendencias_ocultas
  for delete using (auth.uid() = user_id);
