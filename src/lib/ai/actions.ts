"use server";

import { createClient } from "@/lib/supabase/server";
import { generarTextoEscena, type GenerarEscenaInput } from "./gemini";

const LIMITE_GENERACIONES = 8;
const VENTANA_MS = 60_000;

const MAX_TITULO = 200;
const MAX_TEXTO = 4000;
const MAX_OTRAS_ESCENAS = 20;

/** Nada de esto debería saltar desde la UI normal — son topes de tamaño en
 *  la entrada del prompt, para que una llamada directa a la acción con datos
 *  fabricados no pueda inflar el coste ni el tamaño de la petición a Gemini. */
function validarInput(input: GenerarEscenaInput) {
  if (input.tituloIdea.length > MAX_TITULO) {
    throw new Error("El título de la idea es demasiado largo");
  }
  if (input.textoActual && input.textoActual.length > MAX_TEXTO) {
    throw new Error("El texto actual es demasiado largo");
  }
  if (input.otrasEscenas.length > MAX_OTRAS_ESCENAS) {
    throw new Error("Demasiadas escenas de contexto");
  }
  for (const escena of input.otrasEscenas) {
    if (escena.texto.length > MAX_TEXTO) {
      throw new Error("Alguna escena de contexto es demasiado larga");
    }
  }
}

export async function generarEscenaConIA(
  input: GenerarEscenaInput
): Promise<{ texto: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  try {
    validarInput(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Entrada inválida" };
  }

  const desde = new Date(Date.now() - VENTANA_MS).toISOString();

  // Autolimpieza del propio historial fuera de la ventana vigente, en vez
  // de depender de un cron aparte para que la tabla no crezca sin límite.
  await supabase.from("generaciones_ia").delete().eq("user_id", user.id).lt("created_at", desde);

  const { count } = await supabase
    .from("generaciones_ia")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", desde);

  if ((count ?? 0) >= LIMITE_GENERACIONES) {
    return {
      error: `Has llegado al límite de ${LIMITE_GENERACIONES} generaciones por minuto. Espera un momento y vuelve a intentarlo.`,
    };
  }

  try {
    const texto = await generarTextoEscena(input);
    await supabase.from("generaciones_ia").insert({});
    return { texto };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo generar el texto" };
  }
}
