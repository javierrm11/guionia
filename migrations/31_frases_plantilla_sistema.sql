-- 31: Hooks y CTAs por defecto, como punto de partida en TikTok.
--
-- Mismo patrón que `24_plantillas_nicho.sql` para las estructuras de guion:
-- `frases_guardadas` no tenía ningún concepto de "plantilla de sistema", así
-- que un hook/CTA por defecto se habría quedado con `user_id` a null e
-- invisible para cualquier cuenta por RLS. Se añade `es_plantilla_sistema`
-- igual que en estructuras_guion, visible para todos, editable/borrable por
-- nadie desde la app (el código nunca expone ese campo).

alter table frases_guardadas add column if not exists es_plantilla_sistema boolean not null default false;
alter table frases_guardadas alter column user_id drop not null;

drop policy if exists "frases_guardadas_select_own" on frases_guardadas;
create policy "frases_guardadas_select_own" on frases_guardadas
  for select using (es_plantilla_sistema or auth.uid() = user_id);

drop policy if exists "frases_guardadas_insert_own" on frases_guardadas;
create policy "frases_guardadas_insert_own" on frases_guardadas
  for insert with check (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "frases_guardadas_update_own" on frases_guardadas;
create policy "frases_guardadas_update_own" on frases_guardadas
  for update using (auth.uid() = user_id and not es_plantilla_sistema);

drop policy if exists "frases_guardadas_delete_own" on frases_guardadas;
create policy "frases_guardadas_delete_own" on frases_guardadas
  for delete using (auth.uid() = user_id and not es_plantilla_sistema);

-- ─────────────────────────────────────────────
-- Hooks y CTAs por defecto para TikTok
-- ─────────────────────────────────────────────

insert into frases_guardadas (plataforma, tipo_escena, texto, es_plantilla_sistema)
values
  ('tiktok', 'hook', '¿Sabías que...?', true),
  ('tiktok', 'hook', 'Esto me hubiera ahorrado años.', true),
  ('tiktok', 'hook', 'Nadie te lo va a decir, así que te lo digo yo.', true),
  ('tiktok', 'hook', 'Si haces esto, para de hacerlo ya.', true),
  ('tiktok', 'cta', 'Sígueme para más contenido como este.', true),
  ('tiktok', 'cta', 'Guárdalo para no perdértelo.', true),
  ('tiktok', 'cta', 'Cuéntame en comentarios qué opinas.', true),
  ('tiktok', 'cta', 'Comparte esto con alguien que lo necesite.', true);
