"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { generarTextoEscena, type GenerarEscenaInput } from "./gemini";

const LIMITE_GENERACIONES = 3;
const VENTANA_MS = 24 * 60 * 60 * 1000;

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

/** Cuántas generaciones lleva el usuario dentro de la ventana vigente —
 *  limpia también su historial fuera de esa ventana de paso, en vez de
 *  depender de un cron aparte para que la tabla no crezca sin límite. */
async function contarUsosVigentes(supabase: SupabaseClient, userId: string) {
  const desde = new Date(Date.now() - VENTANA_MS).toISOString();

  await supabase
    .from("generaciones_ia")
    .delete()
    .eq("user_id", userId)
    .lt("created_at", desde);

  const { count } = await supabase
    .from("generaciones_ia")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", desde);

  return count ?? 0;
}

/** Usos de IA que le quedan hoy al usuario — para mostrarlo en el botón
 *  antes incluso de haberlo usado nunca. `0` si no hay usuario autenticado
 *  (el botón ya no se muestra sin sesión, pero por si acaso). */
export async function obtenerUsosIaRestantes(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const usos = await contarUsosVigentes(supabase, user.id);
  return Math.max(0, LIMITE_GENERACIONES - usos);
}

export async function generarEscenaConIA(
  input: GenerarEscenaInput,
): Promise<
  { texto: string; restantes: number } | { error: string; restantes: number }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", restantes: 0 };

  try {
    validarInput(input);
  } catch (error) {
    const restantes = Math.max(
      0,
      LIMITE_GENERACIONES - (await contarUsosVigentes(supabase, user.id)),
    );
    return {
      error: error instanceof Error ? error.message : "Entrada inválida",
      restantes,
    };
  }

  const usos = await contarUsosVigentes(supabase, user.id);

  if (usos >= LIMITE_GENERACIONES) {
    return {
      error: `Has llegado al límite de ${LIMITE_GENERACIONES} generaciones con IA al día. Vuelve a intentarlo mañana.`,
      restantes: 0,
    };
  }

  try {
    const texto = await generarTextoEscena(input);
    await supabase.from("generaciones_ia").insert({});
    return { texto, restantes: LIMITE_GENERACIONES - usos - 1 };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo generar el texto",
      restantes: LIMITE_GENERACIONES - usos,
    };
  }
}
