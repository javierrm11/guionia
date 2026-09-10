import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";

export type RendimientoFrase = {
  usos: number;
  vistasMedia: number;
  retencionMedia: number;
};

/**
 * Métricas por vídeo de todo el canal, en una sola llamada a la Analytics
 * API (`dimensions=video`) — evita una llamada por vídeo cuando lo que hace
 * falta es cruzar un puñado de ids conocidos (`youtube_video_id` de piezas
 * publicadas) contra sus estadísticas. `maxResults` alto para cubrir
 * canales con muchos vídeos; si el canal tiene más, los más vistos quedan
 * primero (`sort=-views`), así que es poco probable perder justo los que
 * llevan un hook/CTA guardado.
 */
export async function obtenerMetricasPorVideo(
  accessToken: string,
): Promise<Map<string, { vistas: number; retencion: number }>> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: "2005-02-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views,averageViewPercentage",
    dimensions: "video",
    sort: "-views",
    maxResults: "1000",
  });

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    throw new Error(
      `No se pudieron leer las métricas por vídeo (${res.status})`,
    );
  }

  const data = await res.json();
  const filas: [string, number, number][] = data.rows ?? [];
  return new Map(filas.map((f) => [f[0], { vistas: f[1], retencion: f[2] }]));
}

/**
 * Rendimiento real de cada hook/CTA guardado, cruzando `escenas_guion.frase_origen_id`
 * (ver migración `28_frase_origen_escena.sql`) con las vistas/retención media
 * de los vídeos de YouTube publicados donde se usó — solo YouTube por ahora,
 * ver `ideas.md` #41 (TikTok no expone retención por vídeo). La métrica es la
 * del vídeo entero, no del instante concreto del hook/CTA: la duración
 * planeada de la escena en el guion no tiene por qué coincidir con el
 * minutaje real del vídeo ya editado, así que un dato "preciso" ahí sería
 * más aparente que real. `null` si no hay YouTube conectado; mapa vacío si
 * no hay ninguna frase usada todavía en un vídeo publicado (sin gastar
 * ninguna llamada a la API en ese caso).
 */
export async function obtenerRendimientoFrases(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, RendimientoFrase> | null> {
  const accessToken = await obtenerAccessTokenValido(supabase, userId);
  if (!accessToken) return null;

  const { data: piezas } = await supabase
    .from("piezas_contenido")
    .select("id, youtube_video_id")
    .eq("plataforma", "youtube")
    .eq("estado", "publicado")
    .not("youtube_video_id", "is", null);

  if (!piezas || piezas.length === 0) return new Map();

  const videoIdPorPieza = new Map(
    piezas.map((p) => [p.id as string, p.youtube_video_id as string]),
  );

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("pieza_id, frase_origen_id")
    .in("pieza_id", [...videoIdPorPieza.keys()])
    .not("frase_origen_id", "is", null)
    .is("deleted_at", null);

  if (!escenas || escenas.length === 0) return new Map();

  // Vídeos distintos (deduplicados) en los que aparece cada frase — si la
  // misma frase se usó dos veces en el mismo vídeo, cuenta como un solo uso.
  const videosPorFrase = new Map<string, Set<string>>();
  for (const e of escenas) {
    const videoId = videoIdPorPieza.get(e.pieza_id as string);
    const fraseId = e.frase_origen_id as string;
    if (!videoId) continue;
    const set = videosPorFrase.get(fraseId) ?? new Set<string>();
    set.add(videoId);
    videosPorFrase.set(fraseId, set);
  }

  if (videosPorFrase.size === 0) return new Map();

  let metricasPorVideo: Map<string, { vistas: number; retencion: number }>;
  try {
    metricasPorVideo = await obtenerMetricasPorVideo(accessToken);
  } catch {
    return new Map();
  }

  const resultado = new Map<string, RendimientoFrase>();
  for (const [fraseId, videoIds] of videosPorFrase) {
    const metricas = [...videoIds]
      .map((id) => metricasPorVideo.get(id))
      .filter((m): m is { vistas: number; retencion: number } => m != null);
    if (metricas.length === 0) continue;

    resultado.set(fraseId, {
      usos: videoIds.size,
      vistasMedia: metricas.reduce((s, m) => s + m.vistas, 0) / metricas.length,
      retencionMedia:
        metricas.reduce((s, m) => s + m.retencion, 0) / metricas.length,
    });
  }

  return resultado;
}
