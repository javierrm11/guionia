import Image from "next/image";
import { Clock, Eye, Heart, MessageSquare, Users, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import {
  obtenerCanalPropio,
  obtenerComparativaPeriodo,
  obtenerFuentesTrafico,
  obtenerVideosDestacados,
  type FuenteTrafico,
  type MetricasPeriodo,
  type VideoDestacado,
} from "@/lib/youtube/oauth";
import { StatMes } from "@/components/StatMesComparativa";
import { CarruselFlechas } from "@/components/CarruselFlechas";
import { calcularLimitesRango, type RangoEstadisticas } from "@/lib/contenido";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

export async function CuentaSection({ rango }: { rango: RangoEstadisticas }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const accessToken = await obtenerAccessTokenValido(supabase, user.id);

  if (!accessToken) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">
          Conecta YouTube para ver las estadísticas de tu cuenta.
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

  const limites = calcularLimitesRango(rango);

  let canal;
  let comparativa: { actual: MetricasPeriodo; anterior: MetricasPeriodo | null } | null = null;
  let destacados: VideoDestacado[] = [];
  let fuentesTrafico: FuenteTrafico[] = [];
  let error = false;

  // Vídeos publicados en el periodo: no es una métrica de la Analytics API —
  // se cuenta de tu propia base de datos, igual que hace TikTok.
  const contarVideos = async (desde: string, hasta: string) => {
    const { count } = await supabase
      .from("piezas_contenido")
      .select("id", { count: "exact", head: true })
      .eq("plataforma", "youtube")
      .eq("estado", "publicado")
      .gte("fecha_publicacion", desde)
      .lte("fecha_publicacion", hasta);
    return count ?? 0;
  };

  try {
    canal = await obtenerCanalPropio(accessToken);
    comparativa = await obtenerComparativaPeriodo(accessToken, limites).catch(() => null);
    destacados = await obtenerVideosDestacados(accessToken).catch(() => []);
    fuentesTrafico = await obtenerFuentesTrafico(accessToken, limites.actualDesde, limites.actualHasta).catch(
      () => []
    );
  } catch {
    error = true;
  }

  const videosActual = await contarVideos(limites.actualDesde, limites.actualHasta).catch(() => 0);
  const videosAnterior =
    limites.anteriorDesde && limites.anteriorHasta
      ? await contarVideos(limites.anteriorDesde, limites.anteriorHasta).catch(() => null)
      : null;

  if (error || !canal) {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-danger">
          No se pudieron cargar las estadísticas de YouTube ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {comparativa && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <StatMes
              icon={Eye}
              etiqueta="Vistas"
              actual={comparativa.actual.vistas}
              anterior={comparativa.anterior?.vistas ?? null}
            />
            <StatMes icon={Video} etiqueta="Vídeos" actual={videosActual} anterior={videosAnterior} />
            <StatMes
              icon={MessageSquare}
              etiqueta="Comentarios"
              actual={comparativa.actual.comentarios}
              anterior={comparativa.anterior?.comentarios ?? null}
            />
            <StatMes
              icon={Heart}
              etiqueta="Likes"
              actual={comparativa.actual.likes}
              anterior={comparativa.anterior?.likes ?? null}
            />
            <StatMes
              icon={Users}
              etiqueta="Suscriptores (neto)"
              actual={comparativa.actual.suscriptoresGanados - comparativa.actual.suscriptoresPerdidos}
              anterior={
                comparativa.anterior
                  ? comparativa.anterior.suscriptoresGanados - comparativa.anterior.suscriptoresPerdidos
                  : null
              }
            />
            <StatMes
              icon={Clock}
              etiqueta="Tiempo de visualización"
              actual={Math.round(comparativa.actual.minutosVistos / 60)}
              anterior={
                comparativa.anterior ? Math.round(comparativa.anterior.minutosVistos / 60) : null
              }
              sufijo=" h"
            />
          </div>
        </div>
      )}

      {destacados.length > 0 && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Mejores vídeos
          </span>
          <CarruselFlechas>
            {destacados.map((video) => (
              <a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg"
              >
                {video.miniatura && (
                  <Image src={video.miniatura} alt="" fill sizes="128px" className="object-cover" />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 55%, transparent)",
                  }}
                />
                <div className="relative z-10 flex flex-col gap-0.5 p-2">
                  <p className="line-clamp-2 text-caption font-medium text-white">{video.titulo}</p>
                  <p className="truncate text-caption text-white/70">
                    {formatoNumero(video.vistas)} vistas · {Math.round(video.retencionMedia)}%
                  </p>
                </div>
              </a>
            ))}
          </CarruselFlechas>
        </div>
      )}

      {fuentesTrafico.length > 0 && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            De dónde vienen tus vistas
          </span>
          <div className="flex flex-col gap-2.5 rounded-md bg-bg-primary p-4">
            {fuentesTrafico.map((fuente) => (
              <div key={fuente.fuente} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-small">
                  <span className="text-text-primary">{fuente.etiqueta}</span>
                  <span className="text-text-secondary">{fuente.porcentaje}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-bg">
                  <div
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${fuente.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
