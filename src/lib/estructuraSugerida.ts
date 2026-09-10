import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plataforma } from "@/lib/plataformas";

/**
 * Estructura sugerida al crear un vídeo nuevo (ideas.md #44): la que más se
 * ha usado en esta plataforma hasta ahora (`piezas_contenido.estructura_origen_id`,
 * ver migración `29_estructura_origen_pieza.sql`). `null` si todavía no se
 * ha creado ningún guion con estructura en esta plataforma — el formulario
 * se queda en "Sin estructura" como hasta ahora, sin sugerir nada.
 */
export async function obtenerEstructuraSugerida(
  supabase: SupabaseClient,
  plataforma: Plataforma,
): Promise<string | null> {
  const { data } = await supabase
    .from("piezas_contenido")
    .select("estructura_origen_id")
    .eq("plataforma", plataforma)
    .not("estructura_origen_id", "is", null);

  if (!data || data.length === 0) return null;

  const conteo = new Map<string, number>();
  for (const p of data) {
    const id = p.estructura_origen_id as string;
    conteo.set(id, (conteo.get(id) ?? 0) + 1);
  }

  return [...conteo.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
