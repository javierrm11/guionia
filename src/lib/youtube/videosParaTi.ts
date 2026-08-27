import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import {
  obtenerCanalPropio,
  obtenerCategoriaMasFrecuente,
  obtenerVideosDelCanal,
  obtenerVideosTendencia,
  type VideoTendencia,
} from "@/lib/youtube/oauth";

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

  let videos = categoryId ? await obtenerVideosTendencia(accessToken, "ES", 20, categoryId) : [];
  if (videos.length === 0) {
    videos = await obtenerVideosTendencia(accessToken);
  }

  try {
    const canalPropio = await obtenerCanalPropio(accessToken);
    videos = videos.filter((v) => v.canalId !== canalPropio.id);
  } catch {
    // Sin canal propio identificable: seguimos mostrando los resultados tal cual.
  }

  return { videos };
}
