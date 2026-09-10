import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerVideosDelUsuario } from "@/lib/tiktok/oauth";

/**
 * Importa como piezas `publicado` los vídeos de la cuenta que todavía no
 * existan en `piezas_contenido` (comparado por `tiktok_video_id`, así que es
 * seguro llamarla varias veces sin duplicar). Compartida entre la conexión
 * inicial (`/api/tiktok/callback`, para no dejar el calendario vacío nada
 * más conectar) y el botón "Sincronizar" manual de
 * `/configuracion/plataformas`, para quien conecta y publica más vídeos
 * después. Devuelve cuántos vídeos nuevos importó.
 */
export async function sincronizarVideosTiktok(
  supabase: SupabaseClient,
  accessToken: string,
): Promise<number> {
  const videosCuenta = await obtenerVideosDelUsuario(accessToken);
  if (videosCuenta.length === 0) return 0;

  const idsCuenta = videosCuenta.map((v) => v.videoId);
  const { data: existentes } = await supabase
    .from("piezas_contenido")
    .select("tiktok_video_id")
    .eq("plataforma", "tiktok")
    .in("tiktok_video_id", idsCuenta);

  const idsExistentes = new Set(
    (existentes ?? []).map((r) => r.tiktok_video_id),
  );
  const nuevos = videosCuenta
    .filter((v) => !idsExistentes.has(v.videoId))
    .sort(
      (a, b) =>
        new Date(a.publicadoEn).getTime() - new Date(b.publicadoEn).getTime(),
    );

  if (nuevos.length === 0) return 0;

  const { data: ultimo } = await supabase
    .from("piezas_contenido")
    .select("numero")
    .eq("plataforma", "tiktok")
    .not("numero", "is", null)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();

  let siguienteNumero = (ultimo?.numero ?? 0) + 1;

  const filas = nuevos.map((v) => ({
    plataforma: "tiktok" as const,
    titulo: v.titulo || "Vídeo de TikTok",
    estado: "publicado" as const,
    fecha_publicacion: v.publicadoEn.slice(0, 10),
    url_publicado: v.shareUrl || null,
    tiktok_video_id: v.videoId,
    numero: siguienteNumero++,
  }));

  const { error } = await supabase.from("piezas_contenido").insert(filas);
  if (error) throw new Error(error.message);

  return filas.length;
}
