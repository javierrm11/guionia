import { Eye, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/tiktok/conexion";
import { obtenerEstadisticasVideos } from "@/lib/tiktok/oauth";

/** Streamed vía `<Suspense>` desde el detalle del guion — mismo motivo que
 *  `EstadisticasYoutubeVideo`: la llamada a la API de TikTok no debe
 *  bloquear el resto de la página. Resuelve su propio access token (a
 *  diferencia de la de YouTube, que lo recibe ya resuelto porque también
 *  lo necesita `RetencionSection` al lado). */
export async function EstadisticasTiktokVideo({ videoId }: { videoId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accessToken = user ? await obtenerAccessTokenValido(supabase, user.id) : null;
  if (!accessToken) return null;

  let stats: { vistas: number; likes: number; comentarios: number; compartidos: number } | null =
    null;
  try {
    const resultado = await obtenerEstadisticasVideos([videoId], accessToken);
    stats = resultado[videoId] ?? null;
  } catch {
    return (
      <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
        <h2 className="text-h2">Estadísticas de TikTok</h2>
        <p className="text-small text-danger">
          No se pudieron cargar las estadísticas ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
      <h2 className="text-h2">Estadísticas de TikTok</h2>
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center gap-1">
          <Eye size={18} strokeWidth={1.5} className="text-accent" />
          <span className="text-h3">{stats.vistas.toLocaleString("es-ES")}</span>
          <span className="text-caption text-text-secondary">vistas</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ThumbsUp size={18} strokeWidth={1.5} className="text-accent" />
          <span className="text-h3">{stats.likes.toLocaleString("es-ES")}</span>
          <span className="text-caption text-text-secondary">likes</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle size={18} strokeWidth={1.5} className="text-accent" />
          <span className="text-h3">{stats.comentarios.toLocaleString("es-ES")}</span>
          <span className="text-caption text-text-secondary">comentarios</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Share2 size={18} strokeWidth={1.5} className="text-accent" />
          <span className="text-h3">{stats.compartidos.toLocaleString("es-ES")}</span>
          <span className="text-caption text-text-secondary">compartidos</span>
        </div>
      </div>
    </div>
  );
}
