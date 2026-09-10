import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { obtenerVideosParaTi } from "@/lib/youtube/videosParaTi";
import { ocultarVideoTendencia } from "@/app/contenido/tendencias/actions";

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
      <div className="rounded-md border border-border p-4">
        <p className="text-small text-danger">
          No se pudieron cargar los vídeos ahora mismo. Inténtalo de nuevo más
          tarde.
        </p>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-border p-4">
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

  const { videos, categoriaLabel } = resultado;

  if (videos.length === 0) {
    return (
      <div className="rounded-md border border-border p-4">
        <p className="text-small text-text-secondary">
          No hay vídeos disponibles ahora mismo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {categoriaLabel && (
        <p className="text-caption text-text-secondary">
          Según tu categoría en YouTube:{" "}
          <span className="text-text-primary">{categoriaLabel}</span>
        </p>
      )}

      <div className="flex flex-col">
        {videos.map((v, index) => (
          <div
            key={v.videoId}
            className={`flex gap-3 py-3 lg:gap-4 lg:py-4 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <a
              href={`https://www.youtube.com/watch?v=${v.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 gap-3 transition-opacity duration-150 hover:opacity-70 lg:gap-4"
            >
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-sm bg-neutral-bg lg:h-24 lg:w-40">
                {v.miniatura && (
                  <Image
                    src={v.miniatura}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                )}
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-caption text-white">
                  <Eye size={11} strokeWidth={1.5} />
                  {v.vistas.toLocaleString("es-ES")}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="line-clamp-2 text-body text-text-primary lg:text-h3">
                  {v.titulo}
                </p>
                <p className="text-small text-text-secondary">{v.canal}</p>
              </div>
            </a>

            <form
              action={ocultarVideoTendencia}
              className="shrink-0 self-start pt-1"
            >
              <input type="hidden" name="videoId" value={v.videoId} />
              <button
                type="submit"
                aria-label="No me interesa este vídeo"
                title="No me interesa"
                className="rounded-full p-1.5 text-text-disabled hover:text-text-secondary"
              >
                <EyeOff size={16} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
