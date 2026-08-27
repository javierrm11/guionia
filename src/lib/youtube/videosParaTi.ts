import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import { obtenerCanalPropio, obtenerVideosTendencia, type VideoTendencia } from "@/lib/youtube/oauth";

/**
 * Vídeos en tendencia en YouTube ahora mismo (sin personalizar por tu perfil
 * de momento) — lógica compartida entre `/contenido/tendencias` (lista
 * completa) y el carrusel del dashboard. `null` si no hay YouTube conectado.
 */
export async function obtenerVideosParaTi(
  supabase: SupabaseClient,
  userId: string
): Promise<{ videos: VideoTendencia[] } | null> {
  const accessToken = await obtenerAccessTokenValido(supabase, userId);
  if (!accessToken) return null;

  let videos = await obtenerVideosTendencia(accessToken);

  try {
    const canalPropio = await obtenerCanalPropio(accessToken);
    videos = videos.filter((v) => v.canalId !== canalPropio.id);
  } catch {
    // Sin canal propio identificable: seguimos mostrando los resultados tal cual.
  }

  return { videos };
}
