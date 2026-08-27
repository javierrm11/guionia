import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import {
  obtenerCanalPropio,
  obtenerComparativaMensual,
  obtenerEstadisticasCanal,
  obtenerFuentesTrafico,
  obtenerVideosDestacados,
  type FuenteTrafico,
  type MetricasPeriodo,
  type VideoDestacado,
} from "@/lib/youtube/oauth";
import { StatMes } from "@/components/StatMesComparativa";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

function formatoDuracion(segundos: number) {
  const min = Math.floor(segundos / 60);
  const seg = Math.round(segundos % 60);
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export async function CuentaSection() {
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

  let canal;
  let generales;
  let comparativa: { actual: MetricasPeriodo; anterior: MetricasPeriodo | null } | null = null;
  let destacados: VideoDestacado[] = [];
  let fuentesTrafico: FuenteTrafico[] = [];
  let error = false;

  try {
    [canal, generales] = await Promise.all([
      obtenerCanalPropio(accessToken),
      obtenerEstadisticasCanal(accessToken),
    ]);
    comparativa = await obtenerComparativaMensual(accessToken).catch(() => null);
    destacados = await obtenerVideosDestacados(accessToken).catch(() => []);
    fuentesTrafico = await obtenerFuentesTrafico(accessToken).catch(() => []);
  } catch {
    error = true;
  }

  if (error || !canal || !generales) {
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
      <div className="flex items-center gap-3">
        {canal.thumbnailUrl && (
          <Image
            src={canal.thumbnailUrl}
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-full"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-h3">{canal.titulo}</p>
          <p className="text-caption text-text-secondary">Canal de YouTube</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Suscriptores</span>
          <span className="text-h2">{formatoNumero(generales.suscriptores)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Vistas totales</span>
          <span className="text-h2">{formatoNumero(generales.vistasTotales)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Vídeos</span>
          <span className="text-h2">{formatoNumero(generales.videos)}</span>
        </div>
      </div>

      {destacados.length > 0 && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Mejores vídeos
          </span>
          <div className="flex flex-col gap-2">
            {destacados.map((video) => (
              <a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md bg-bg-primary p-2.5 hover:bg-accent-bg active:bg-accent-bg"
              >
                {video.miniatura ? (
                  <Image
                    src={video.miniatura}
                    alt=""
                    width={96}
                    height={54}
                    className="h-[54px] w-24 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <div className="h-[54px] w-24 shrink-0 rounded-sm bg-bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-small font-medium text-text-primary">
                    {video.titulo}
                  </p>
                  <p className="mt-0.5 text-caption text-text-secondary">
                    {formatoNumero(video.vistas)} vistas · {formatoNumero(video.comentarios)}{" "}
                    comentarios · {Math.round(video.retencionMedia)}% retención ·{" "}
                    {formatoDuracion(video.duracionMediaSegundos)} de media
                    {video.ctrImpresiones != null &&
                      ` · ${Math.round(video.ctrImpresiones * 100)}% CTR miniatura`}
                  </p>
                  <p className="mt-1 text-caption text-text-disabled">{video.motivo}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {comparativa && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Este mes, respecto al anterior
          </span>
          <div className="grid grid-cols-2 gap-3">
            <StatMes
              etiqueta="Vistas"
              actual={comparativa.actual.vistas}
              anterior={comparativa.anterior?.vistas ?? null}
            />
            <StatMes
              etiqueta="Comentarios"
              actual={comparativa.actual.comentarios}
              anterior={comparativa.anterior?.comentarios ?? null}
            />
            <StatMes
              etiqueta="Likes"
              actual={comparativa.actual.likes}
              anterior={comparativa.anterior?.likes ?? null}
            />
            <StatMes
              etiqueta="Suscriptores (neto)"
              actual={comparativa.actual.suscriptoresGanados - comparativa.actual.suscriptoresPerdidos}
              anterior={
                comparativa.anterior
                  ? comparativa.anterior.suscriptoresGanados - comparativa.anterior.suscriptoresPerdidos
                  : null
              }
            />
            <StatMes
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

      {fuentesTrafico.length > 0 && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            De dónde vienen tus vistas (este mes)
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
