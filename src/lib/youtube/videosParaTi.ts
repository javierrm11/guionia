import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import {
  obtenerCanalPropio,
  obtenerCategoriaMasFrecuente,
  obtenerVideosDelCanal,
  obtenerVideosTendencia,
  type VideoTendencia,
} from "@/lib/youtube/oauth";

/** categoryId de YouTube para "Música" — domina el chart general de tendencias
 *  (mostPopular) en España, así que se excluye del fallback sin categoría
 *  propia (cuentas nuevas, sin vídeos todavía) para que no parezca que la
 *  app solo enseña vídeos musicales. Cuando sí hay categoría propia
 *  detectada, se respeta tal cual aunque sea música. */
const CATEGORIA_MUSICA = "10";
const LIMITE_TENDENCIA = 20;

/**
 * Vídeos en tendencia de tu misma categoría de YouTube (Educación, Howto &
 * Style...) — lógica compartida entre `/contenido/tendencias` (lista
 * completa) y el carrusel del dashboard. `null` si no hay YouTube conectado.
 */
export async function obtenerVideosParaTi(
  supabase: SupabaseClient,
  userId: string
): Promise<{ videos: VideoTendencia[] } | null> {
  const accessToken = await obtenerAccessTokenValido(supabase, userId);
  if (!accessToken) return null;

  let categoryId: string | null = null;
  try {
    const propios = await obtenerVideosDelCanal(accessToken, 10);
    categoryId = await obtenerCategoriaMasFrecuente(
      propios.map((v) => v.videoId),
      accessToken
    );
  } catch {
    // Sin vídeos propios identificables: se sigue con la tendencia general.
  }

  let videos = categoryId
    ? await obtenerVideosTendencia(accessToken, "ES", LIMITE_TENDENCIA, categoryId)
    : [];
  if (videos.length === 0) {
    // Sin categoría propia (cuenta nueva): se piden más de la cuenta para
    // poder descartar música y aun así llegar al límite deseado.
    const generales = await obtenerVideosTendencia(accessToken, "ES", LIMITE_TENDENCIA * 2);
    videos = generales.filter((v) => v.categoryId !== CATEGORIA_MUSICA).slice(0, LIMITE_TENDENCIA);
  }

  try {
    const canalPropio = await obtenerCanalPropio(accessToken);
    videos = videos.filter((v) => v.canalId !== canalPropio.id);
  } catch {
    // Sin canal propio identificable: seguimos mostrando los resultados tal cual.
  }

  return { videos };
}
