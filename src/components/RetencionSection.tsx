import { RetencionChart } from "./RetencionChart";
import { obtenerRetencionVideo } from "@/lib/youtube/oauth";

export async function RetencionSection({
  videoId,
  accessToken,
}: {
  videoId: string;
  accessToken: string;
}) {
  let datos: Awaited<ReturnType<typeof obtenerRetencionVideo>> = [];
  let error = false;
  try {
    datos = await obtenerRetencionVideo(videoId, accessToken);
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border p-4">
        <h2 className="text-h2">Retención de audiencia</h2>
        <p className="text-small text-danger">
          No se pudieron cargar los datos de retención ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (datos.length < 2) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border p-4">
        <h2 className="text-h2">Retención de audiencia</h2>
        <p className="text-small text-text-secondary">
          Todavía no hay datos suficientes de retención para este vídeo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <h2 className="text-h2">Retención de audiencia</h2>
      <RetencionChart datos={datos} />
    </div>
  );
}
