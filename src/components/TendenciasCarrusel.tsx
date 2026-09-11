import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, TrendingUp } from "lucide-react";
import { CarruselFlechas } from "@/components/CarruselFlechas";
import { createClient } from "@/lib/supabase/server";
import { obtenerVideosParaTi } from "@/lib/youtube/videosParaTi";

const LIMITE = 10;

/** Tira horizontal de vídeos parecidos a los tuyos, en el dashboard de
 *  Control. Sin YouTube conectado muestra un CTA para conectarlo en vez de
 *  desaparecer sin más (antes no salía nada); solo se oculta del todo si el
 *  chart viene vacío o falla la llamada. `enSidebar` la adapta a la barra
 *  lateral de escritorio (sin sangrado hasta el borde, que ahí se solaparía
 *  con la columna principal). */
export async function TendenciasCarrusel({
  enSidebar = false,
  sangrado = true,
}: {
  enSidebar?: boolean;
  /** Sangrado hasta el borde de la tira de vídeos (ver `CarruselFlechas`) —
   *  desactívalo (`false`) para que las tarjetas respeten el mismo margen
   *  lateral que el resto del contenido en vez de llegar hasta el borde. */
  sangrado?: boolean;
}) {
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
  if (resultado && resultado.videos.length === 0) return null;

  const cabecera = (
    <div className="flex items-center justify-between">
      <span
        className="flex items-center gap-1.5 text-caption font-display text-text-secondary uppercase lg:text-body"
        style={{ letterSpacing: "0.06em" }}
      >
        <TrendingUp size={14} strokeWidth={1.5} className="lg:h-4 lg:w-4" />
        Tendencias
      </span>
      {resultado && (
        <Link
          href="/contenido/tendencias"
          className="flex items-center gap-0.5 text-caption text-text-secondary"
        >
          Ver todas
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      )}
    </div>
  );

  if (!resultado) {
    return (
      <section className="flex flex-col gap-3 border-b border-border pt-8 pb-6 lg:gap-4 lg:pt-10 lg:pb-8">
        {cabecera}
        <div className="flex flex-col items-start gap-4 rounded-md border border-border p-6 lg:p-8">
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
      </section>
    );
  }

  const videos = resultado.videos.slice(0, LIMITE);

  return (
    <section className="flex flex-col gap-3 border-b border-border pt-8 pb-6 lg:gap-4 lg:pt-10 lg:pb-8">
      {cabecera}

      <CarruselFlechas bleedLg={!enSidebar} bleed={sangrado}>
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg transition-[transform,box-shadow] duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lg ${enSidebar ? "" : "lg:h-48 lg:w-36"}`}
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
            <div className="relative z-10 flex flex-col gap-0.5 p-2 lg:p-2.5">
              <p className="truncate text-[11px] font-medium text-white lg:text-caption">
                {v.titulo}
              </p>
              <p className="truncate text-caption text-white/70">{v.canal}</p>
            </div>
          </a>
        ))}
      </CarruselFlechas>
    </section>
  );
}
