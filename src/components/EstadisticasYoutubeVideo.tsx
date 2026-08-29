import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { obtenerEstadisticasVideos } from "@/lib/youtube/oauth";

/** Streamed vía `<Suspense>` desde el detalle del guion — la llamada a la
 *  Data API de YouTube no debe bloquear el resto de la página (texto del
 *  guion, acciones), que ya está disponible al instante desde la BD. */
export async function EstadisticasYoutubeVideo({
  videoId,
  accessToken,
}: {
  videoId: string;
  accessToken: string;
}) {
  let stats: { vistas: number; likes: number; comentarios: number } | null = null;
  try {
    const resultado = await obtenerEstadisticasVideos([videoId], accessToken);
    stats = resultado[videoId] ?? null;
  } catch {
    return (
      <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
        <h2 className="text-h2">Estadísticas de YouTube</h2>
        <p className="text-small text-danger">
          No se pudieron cargar las estadísticas ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
      <h2 className="text-h2">Estadísticas de YouTube</h2>
      <div className="grid grid-cols-3 gap-3">
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
      </div>
    </div>
  );
}
