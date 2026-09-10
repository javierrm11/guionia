import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plataforma } from "@/lib/plataformas";

/**
 * Pilar sugerido al crear un vídeo nuevo directamente (sin pasar por una
 * idea, que ya trae su propio pilar): el que más se ha usado hasta ahora en
 * esta plataforma, entre las piezas que tienen pilar asignado (se ignoran
 * las que no lo tienen). `null` si todavía no hay ninguna — el formulario
 * se queda en "Sin definir" como hasta ahora.
 */
export async function obtenerPilarSugerido(
  supabase: SupabaseClient,
  plataforma: Plataforma,
): Promise<string | null> {
  const { data } = await supabase
    .from("piezas_contenido")
    .select("pilar")
    .eq("plataforma", plataforma)
    .not("pilar", "is", null);

  if (!data || data.length === 0) return null;

  const conteo = new Map<string, number>();
  for (const p of data) {
    const pilar = p.pilar as string;
    conteo.set(pilar, (conteo.get(pilar) ?? 0) + 1);
  }

  return [...conteo.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
