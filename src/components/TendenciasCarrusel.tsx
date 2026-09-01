import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, TrendingUp } from "lucide-react";
import { CarruselFlechas } from "@/components/CarruselFlechas";
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
    <section className="flex flex-col gap-3 border-b border-border pt-8 pb-6">
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          <TrendingUp size={14} strokeWidth={1.5} />
          Tendencias
        </span>
        <Link
          href="/contenido/tendencias"
          className="flex items-center gap-0.5 text-caption text-text-secondary"
        >
          Ver todas
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>

      <CarruselFlechas>
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg transition-[transform,box-shadow] duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lg"
          >
            {v.miniatura && (
              <Image
                src={v.miniatura}
                alt=""
                fill
                sizes="256px"
                quality={90}
                className="object-cover"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 55%, transparent)",
              }}
            />
            <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-caption text-white">
              <Eye size={12} strokeWidth={1.5} />
              {v.vistas.toLocaleString("es-ES")}
            </span>
            <div className="relative z-10 flex flex-col gap-0.5 p-2">
              <p className="truncate text-[11px] font-medium text-white">{v.titulo}</p>
              <p className="truncate text-caption text-white/70">{v.canal}</p>
            </div>
          </a>
        ))}
      </CarruselFlechas>
    </section>
  );
}
