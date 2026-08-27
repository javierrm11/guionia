import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerVideosParaTi } from "@/lib/youtube/videosParaTi";

export async function TendenciasSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let resultado;
  try {
    resultado = await obtenerVideosParaTi(supabase, user.id);
  } catch {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-danger">
          No se pudieron cargar los vídeos ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">
          Conecta YouTube para ver vídeos parecidos a los tuyos.
        </p>
        <a
          href="/api/youtube/conectar"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Conectar YouTube
        </a>
      </div>
    );
  }

  const { videos } = resultado;

  if (videos.length === 0) {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">No hay vídeos disponibles ahora mismo.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((v) => (
        <a
          key={v.videoId}
          href={`https://www.youtube.com/watch?v=${v.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 rounded-md bg-bg-primary p-3 hover:bg-accent-bg active:bg-accent-bg"
        >
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-sm bg-neutral-bg">
            {v.miniatura && (
              <Image src={v.miniatura} alt="" fill sizes="128px" className="object-cover" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="line-clamp-2 text-body text-text-primary">{v.titulo}</p>
            <p className="text-small text-text-secondary">{v.canal}</p>
            <p className="text-caption text-text-disabled">
              {v.vistas.toLocaleString("es-ES")} vistas
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
