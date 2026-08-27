import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { obtenerVideosParaTi } from "@/lib/youtube/videosParaTi";

const LIMITE = 10;

/** Tira horizontal de vídeos parecidos a los tuyos, en el dashboard de Control — nada si no hay nada que mostrar. */
export async function TendenciasCarrusel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let resultado;
  try {
    resultado = await obtenerVideosParaTi(supabase, user.id);
  } catch {
    return null;
  }
  if (!resultado || resultado.videos.length === 0) return null;

  const videos = resultado.videos.slice(0, LIMITE);

  return (
    <section className="flex flex-col gap-3 border-b border-border py-6">
      <div className="flex items-center justify-between">
        <span
          className="text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Tendencias
        </span>
        <Link href="/contenido/tendencias" className="text-caption text-accent">
          Ver todas
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg"
          >
            {v.miniatura && (
              <Image src={v.miniatura} alt="" fill sizes="128px" className="object-cover" />
            )}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 55%, transparent)",
              }}
            />
            <div className="relative z-10 flex flex-col gap-0.5 p-2">
              <p className="line-clamp-2 text-caption font-medium text-white">{v.titulo}</p>
              <p className="truncate text-caption text-white/70">{v.canal}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
