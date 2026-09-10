-- 28: Vínculo escena → frase guardada (hook/CTA) de origen.
--
-- Al insertar un hook/CTA guardado en una escena (GuionForm.tsx) solo se
-- copiaba el texto, sin recordar de qué frase venía — así que no había forma
-- de saber después qué frases funcionan mejor de verdad. `frase_origen_id`
-- se guarda al insertar y se queda tal cual aunque el texto se edite después
-- a mano (mide "partiste de esta frase", no "el texto final es idéntico").
-- `on delete set null`: borrar la frase original de la papelera no debe
-- romper ni la escena ni su guion.

alter table escenas_guion
  add column frase_origen_id uuid references frases_guardadas(id) on delete set null;
