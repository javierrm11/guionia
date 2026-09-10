import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerVideosDelCanal } from "@/lib/youtube/oauth";

/**
 * Importa como piezas `publicado` los vídeos del canal que todavía no
 * existan en `piezas_contenido` (comparado por `youtube_video_id`, así que
 * es seguro llamarla varias veces sin duplicar). Compartida entre la
 * conexión inicial (`/api/youtube/callback`, para no dejar el calendario
 * vacío nada más conectar) y el botón "Sincronizar" manual de
 * `/configuracion/plataformas`, para quien conecta y publica más vídeos
 * después. Devuelve cuántos vídeos nuevos importó.
 */
export async function sincronizarVideosYoutube(
  supabase: SupabaseClient,
  accessToken: string,
): Promise<number> {
  const videosCanal = await obtenerVideosDelCanal(accessToken);
  if (videosCanal.length === 0) return 0;

  const idsCanal = videosCanal.map((v) => v.videoId);
  const { data: existentes } = await supabase
    .from("piezas_contenido")
    .select("youtube_video_id")
    .eq("plataforma", "youtube")
    .in("youtube_video_id", idsCanal);

  const idsExistentes = new Set(
    (existentes ?? []).map((r) => r.youtube_video_id),
  );
  const nuevos = videosCanal
    .filter((v) => !idsExistentes.has(v.videoId))
    .sort(
      (a, b) =>
        new Date(a.publicadoEn).getTime() - new Date(b.publicadoEn).getTime(),
    );

  if (nuevos.length === 0) return 0;

  const { data: ultimo } = await supabase
    .from("piezas_contenido")
    .select("numero")
    .eq("plataforma", "youtube")
    .not("numero", "is", null)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();

  let siguienteNumero = (ultimo?.numero ?? 0) + 1;

  const filas = nuevos.map((v) => ({
    plataforma: "youtube" as const,
    titulo: v.titulo,
    estado: "publicado" as const,
    fecha_publicacion: v.publicadoEn.slice(0, 10),
    url_publicado: `https://www.youtube.com/watch?v=${v.videoId}`,
    youtube_video_id: v.videoId,
    numero: siguienteNumero++,
  }));

  const { error } = await supabase.from("piezas_contenido").insert(filas);
  if (error) throw new Error(error.message);

  return filas.length;
}
