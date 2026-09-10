import Image from "next/image";
import { Eye, Heart, MessageSquare, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido as obtenerTokenYoutube } from "@/lib/youtube/conexion";
import { obtenerAccessTokenValido as obtenerTokenTiktok } from "@/lib/tiktok/conexion";
import {
  obtenerComparativaPeriodo,
  obtenerVideosDestacados,
} from "@/lib/youtube/oauth";
import { obtenerEstadisticasVideos } from "@/lib/tiktok/oauth";
import { StatMes } from "@/components/StatMesComparativa";
import { CarruselFlechas } from "@/components/CarruselFlechas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PLATAFORMA_ICON } from "@/lib/plataformas";
import { calcularLimitesRango, type RangoEstadisticas } from "@/lib/contenido";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

function chunk<T>(items: T[], tamano: number): T[][] {
  const grupos: T[][] = [];
  for (let i = 0; i < items.length; i += tamano)
    grupos.push(items.slice(i, i + tamano));
  return grupos;
}

type VideoUnificado = {
  id: string;
  plataforma: "youtube" | "tiktok";
  titulo: string;
  vistas: number;
  miniatura: string | null;
  href: string;
};

/** Cruza YouTube y TikTok en un único panel — suma solo las métricas que
 *  ambas plataformas tienen en común (vistas, vídeos, comentarios, likes;
 *  no suscriptores/tiempo de visualización, propios de YouTube, ni
 *  compartidos/seguidores, propios de TikTok, que se quedan en la vista
 *  individual de cada una). Si el usuario solo tiene una plataforma
 *  conectada, el total combinado es simplemente el de esa plataforma —
 *  degradación intencionada, no un caso de error. */
export async function CuentaUnificadaSection({
  rango,
}: {
  rango: RangoEstadisticas;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [tokenYoutube, tokenTiktok] = await Promise.all([
    obtenerTokenYoutube(supabase, user.id),
    obtenerTokenTiktok(supabase, user.id),
  ]);

  if (!tokenYoutube && !tokenTiktok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">
          Conecta YouTube o TikTok para ver un resumen combinado de tus
          estadísticas.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/youtube/conectar"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Conectar YouTube
          </a>
          <a
            href="/api/tiktok/conectar"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Conectar TikTok
          </a>
        </div>
      </div>
    );
  }

  const limites = calcularLimitesRango(rango);

  const contarVideosYoutube = async (desde: string, hasta: string) => {
    const { count } = await supabase
      .from("piezas_contenido")
      .select("id", { count: "exact", head: true })
      .eq("plataforma", "youtube")
      .eq("estado", "publicado")
      .gte("fecha_publicacion", desde)
      .lte("fecha_publicacion", hasta);
    return count ?? 0;
  };

  let vistasYt = { actual: 0, anterior: 0 };
  let comentariosYt = { actual: 0, anterior: 0 };
  let likesYt = { actual: 0, anterior: 0 };
  let videosYt = { actual: 0, anterior: 0 };
  let hayAnteriorYt = false;
  let destacadosYt: VideoUnificado[] = [];

  if (tokenYoutube) {
    const comparativa = await obtenerComparativaPeriodo(
      tokenYoutube,
      limites,
    ).catch(() => null);
    if (comparativa) {
      vistasYt = {
        actual: comparativa.actual.vistas,
        anterior: comparativa.anterior?.vistas ?? 0,
      };
      comentariosYt = {
        actual: comparativa.actual.comentarios,
        anterior: comparativa.anterior?.comentarios ?? 0,
      };
      likesYt = {
        actual: comparativa.actual.likes,
        anterior: comparativa.anterior?.likes ?? 0,
      };
      hayAnteriorYt = comparativa.anterior != null;
    }
    videosYt = {
      actual: await contarVideosYoutube(
        limites.actualDesde,
        limites.actualHasta,
      ).catch(() => 0),
      anterior:
        limites.anteriorDesde && limites.anteriorHasta
          ? await contarVideosYoutube(
              limites.anteriorDesde,
              limites.anteriorHasta,
            ).catch(() => 0)
          : 0,
    };
    const destacados = await obtenerVideosDestacados(tokenYoutube).catch(
      () => [],
    );
    destacadosYt = destacados.map((v) => ({
      id: v.videoId,
      plataforma: "youtube" as const,
      titulo: v.titulo,
      vistas: v.vistas,
      miniatura: v.miniatura,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
    }));
  }

  let vistasTt = { actual: 0, anterior: 0 };
  let comentariosTt = { actual: 0, anterior: 0 };
  let likesTt = { actual: 0, anterior: 0 };
  let videosTt = { actual: 0, anterior: 0 };
  let hayAnteriorTt = false;
  let destacadosTt: VideoUnificado[] = [];

  if (tokenTiktok) {
    const desdeConsulta = limites.anteriorDesde ?? limites.actualDesde;
    const { data: piezas } = await supabase
      .from("piezas_contenido")
      .select("tiktok_video_id, fecha_publicacion, titulo, url_publicado")
      .eq("plataforma", "tiktok")
      .eq("estado", "publicado")
      .not("tiktok_video_id", "is", null)
      .gte("fecha_publicacion", desdeConsulta);

    const lista = piezas ?? [];
    const statsPorId = new Map<
      string,
      {
        vistas: number;
        likes: number;
        comentarios: number;
        miniatura: string | null;
      }
    >();

    if (lista.length > 0) {
      try {
        const ids = lista.map((p) => p.tiktok_video_id as string);
        const resultados = await Promise.all(
          chunk(ids, 20).map((grupo) =>
            obtenerEstadisticasVideos(grupo, tokenTiktok),
          ),
        );
        for (const r of resultados) {
          for (const [id, s] of Object.entries(r)) {
            statsPorId.set(id, {
              vistas: s.vistas,
              likes: s.likes,
              comentarios: s.comentarios,
              miniatura: s.miniatura,
            });
          }
        }
      } catch {
        // Sin agregado del periodo si falla — el resto del panel sigue igual.
      }
    }

    const acumular = (desde: string, hasta: string) =>
      lista.reduce(
        (total, p) => {
          const fecha = p.fecha_publicacion as string;
          if (fecha < desde || fecha > hasta) return total;
          const s = statsPorId.get(p.tiktok_video_id as string);
          if (!s) return total;
          return {
            vistas: total.vistas + s.vistas,
            likes: total.likes + s.likes,
            comentarios: total.comentarios + s.comentarios,
          };
        },
        { vistas: 0, likes: 0, comentarios: 0 },
      );

    const actual = acumular(limites.actualDesde, limites.actualHasta);
    hayAnteriorTt = Boolean(limites.anteriorDesde && limites.anteriorHasta);
    const anterior = hayAnteriorTt
      ? acumular(
          limites.anteriorDesde as string,
          limites.anteriorHasta as string,
        )
      : { vistas: 0, likes: 0, comentarios: 0 };

    vistasTt = { actual: actual.vistas, anterior: anterior.vistas };
    comentariosTt = {
      actual: actual.comentarios,
      anterior: anterior.comentarios,
    };
    likesTt = { actual: actual.likes, anterior: anterior.likes };

    const contarVideos = (desde: string, hasta: string) =>
      lista.filter((p) => {
        const fecha = p.fecha_publicacion as string;
        return fecha >= desde && fecha <= hasta;
      }).length;
    videosTt = {
      actual: contarVideos(limites.actualDesde, limites.actualHasta),
      anterior: hayAnteriorTt
        ? contarVideos(
            limites.anteriorDesde as string,
            limites.anteriorHasta as string,
          )
        : 0,
    };

    destacadosTt = lista
      .map((p): VideoUnificado | null => {
        const s = statsPorId.get(p.tiktok_video_id as string);
        if (!s) return null;
        return {
          id: p.tiktok_video_id as string,
          plataforma: "tiktok",
          titulo: p.titulo as string,
          vistas: s.vistas,
          miniatura: s.miniatura,
          href:
            (p.url_publicado as string | null) ??
            `https://www.tiktok.com/video/${p.tiktok_video_id}`,
        };
      })
      .filter((v): v is VideoUnificado => v != null);
  }

  const hayAnterior = hayAnteriorYt || hayAnteriorTt;

  const destacados = [...destacadosYt, ...destacadosTt]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatMes
            icon={Eye}
            etiqueta="Vistas"
            actual={vistasYt.actual + vistasTt.actual}
            anterior={
              hayAnterior ? vistasYt.anterior + vistasTt.anterior : null
            }
          />
          <StatMes
            icon={Video}
            etiqueta="Vídeos"
            actual={videosYt.actual + videosTt.actual}
            anterior={
              hayAnterior ? videosYt.anterior + videosTt.anterior : null
            }
          />
          <StatMes
            icon={MessageSquare}
            etiqueta="Comentarios"
            actual={comentariosYt.actual + comentariosTt.actual}
            anterior={
              hayAnterior
                ? comentariosYt.anterior + comentariosTt.anterior
                : null
            }
          />
          <StatMes
            icon={Heart}
            etiqueta="Likes"
            actual={likesYt.actual + likesTt.actual}
            anterior={hayAnterior ? likesYt.anterior + likesTt.anterior : null}
          />
        </div>
        {tokenYoutube && tokenTiktok && (
          <div className="flex flex-wrap gap-2">
            {(["youtube", "tiktok"] as const).map((p) => {
              const Icon = PLATAFORMA_ICON[p];
              const vistas =
                p === "youtube" ? vistasYt.actual : vistasTt.actual;
              return (
                <span
                  key={p}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-bg px-3 py-1.5 text-caption text-text-secondary"
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-sm"
                    style={{ backgroundColor: PLATAFORMA_TONO[p] }}
                  >
                    <Icon size={10} strokeWidth={1.5} className="text-white" />
                  </span>
                  {formatoNumero(vistas)} vistas
                </span>
              );
            })}
          </div>
        )}
        {(!tokenYoutube || !tokenTiktok) && (
          <a
            href={
              tokenYoutube ? "/api/tiktok/conectar" : "/api/youtube/conectar"
            }
            className="text-caption text-accent"
          >
            Conecta {tokenYoutube ? "TikTok" : "YouTube"} para completar el
            resumen combinado →
          </a>
        )}
      </div>

      {destacados.length > 0 && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase lg:text-body"
            style={{ letterSpacing: "0.06em" }}
          >
            Mejores vídeos
          </span>
          <CarruselFlechas>
            {destacados.map((video) => {
              const Icon = PLATAFORMA_ICON[video.plataforma];
              return (
                <a
                  key={`${video.plataforma}-${video.id}`}
                  href={video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg lg:h-48 lg:w-36"
                >
                  {video.miniatura && (
                    <Image
                      src={video.miniatura}
                      alt=""
                      fill
                      sizes="128px"
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
                  <span
                    className="absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded-sm"
                    style={{
                      backgroundColor: PLATAFORMA_TONO[video.plataforma],
                    }}
                  >
                    <Icon size={11} strokeWidth={1.5} className="text-white" />
                  </span>
                  <div className="relative z-10 flex flex-col gap-0.5 p-2">
                    <p className="line-clamp-2 text-caption font-medium text-white">
                      {video.titulo}
                    </p>
                    <p className="truncate text-caption text-white/70">
                      {formatoNumero(video.vistas)} vistas
                    </p>
                  </div>
                </a>
              );
            })}
          </CarruselFlechas>
        </div>
      )}
    </div>
  );
}
