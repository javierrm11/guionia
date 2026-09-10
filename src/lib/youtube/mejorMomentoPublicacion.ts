import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import { obtenerFechasPublicacionVideos } from "@/lib/youtube/oauth";
import { obtenerMetricasPorVideo } from "@/lib/youtube/rendimientoFrases";

export type MejorMomento = {
  /** 1 = lunes ... 7 = domingo, igual que el resto de la app. */
  diaSemana: number;
  /** Hora local (Europe/Madrid), 0-23. */
  hora: number;
  vistasMedia: number;
  /** Nº de vídeos detrás del dato — para que la UI pueda avisar si es solo 1. */
  muestras: number;
};

const DIAS_ORDEN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Día de la semana (1=lunes...7=domingo) y hora (0-23) en hora de Madrid,
 *  a partir de una fecha/hora real en UTC (`snippet.publishedAt`). */
function diaYHoraLocal(iso: string): { diaSemana: number; hora: number } {
  const fecha = new Date(iso);
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(fecha);

  const weekday = partes.find((p) => p.type === "weekday")?.value ?? "Mon";
  const horaTexto = partes.find((p) => p.type === "hour")?.value ?? "0";
  const hora = Number(horaTexto) % 24; // "24" a medianoche en algunos entornos

  return { diaSemana: DIAS_ORDEN.indexOf(weekday) + 1 || 1, hora };
}

/**
 * A qué día y hora reales (hora de Madrid) le funcionan mejor los vídeos ya
 * publicados en YouTube, cruzando la fecha/hora real de publicación
 * (`obtenerFechasPublicacionVideos` — no la que guarda la propia app, que
 * solo tiene el día) con las vistas de cada vídeo. Es hora real desde el
 * primer vídeo, no algo que haya que empezar a acumular desde cero: YouTube
 * ya sabe a qué hora se publicó cada vídeo, se use o no esa hora para nada
 * dentro de la app. `null` sin YouTube conectado o sin ningún vídeo
 * publicado todavía.
 */
export async function obtenerMejorMomentoPublicacion(
  supabase: SupabaseClient,
  userId: string,
): Promise<MejorMomento | null> {
  const accessToken = await obtenerAccessTokenValido(supabase, userId);
  if (!accessToken) return null;

  const { data: piezas } = await supabase
    .from("piezas_contenido")
    .select("youtube_video_id")
    .eq("plataforma", "youtube")
    .eq("estado", "publicado")
    .not("youtube_video_id", "is", null);

  const videoIds = (piezas ?? []).map((p) => p.youtube_video_id as string);
  if (videoIds.length === 0) return null;

  let fechas: Map<string, string>;
  let metricas: Map<string, { vistas: number; retencion: number }>;
  try {
    [fechas, metricas] = await Promise.all([
      obtenerFechasPublicacionVideos(videoIds, accessToken),
      obtenerMetricasPorVideo(accessToken),
    ]);
  } catch {
    return null;
  }

  const grupos = new Map<
    string,
    { vistas: number[]; diaSemana: number; hora: number }
  >();
  for (const id of videoIds) {
    const iso = fechas.get(id);
    const metrica = metricas.get(id);
    if (!iso || !metrica) continue;

    const { diaSemana, hora } = diaYHoraLocal(iso);
    const clave = `${diaSemana}-${hora}`;
    const grupo = grupos.get(clave) ?? { vistas: [], diaSemana, hora };
    grupo.vistas.push(metrica.vistas);
    grupos.set(clave, grupo);
  }

  let mejor: MejorMomento | null = null;
  for (const g of grupos.values()) {
    const vistasMedia = g.vistas.reduce((a, b) => a + b, 0) / g.vistas.length;
    if (!mejor || vistasMedia > mejor.vistasMedia) {
      mejor = {
        diaSemana: g.diaSemana,
        hora: g.hora,
        vistasMedia,
        muestras: g.vistas.length,
      };
    }
  }

  return mejor;
}
