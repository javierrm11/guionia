import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/tiktok/conexion";
import {
  obtenerCuentaPropia,
  obtenerEstadisticasCuentaTiktok,
  obtenerEstadisticasVideos,
} from "@/lib/tiktok/oauth";
import { StatMes } from "@/components/StatMesComparativa";
import { calcularLimitesRango, type RangoEstadisticas } from "@/lib/contenido";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

function chunk<T>(items: T[], tamano: number): T[][] {
  const grupos: T[][] = [];
  for (let i = 0; i < items.length; i += tamano) grupos.push(items.slice(i, i + tamano));
  return grupos;
}

export async function CuentaTiktokSection({ rango }: { rango: RangoEstadisticas }) {
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
          Conecta TikTok para ver las estadísticas de tu cuenta.
        </p>
        <a
          href="/api/tiktok/conectar"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Conectar TikTok
        </a>
      </div>
    );
  }

  try {
    await obtenerCuentaPropia(accessToken);
  } catch {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-danger">
          No se pudieron cargar las estadísticas de TikTok ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  // Aparte de la cuenta básica: requiere el scope `user.info.stats`, que puede
  // no estar activo/aprobado todavía — si falla, seguimos mostrando el resto.
  const estadisticasCuenta = await obtenerEstadisticasCuentaTiktok(accessToken).catch(() => null);

  // TikTok no tiene una API de analítica agregada — sumamos las estadísticas
  // (ya disponibles por vídeo, totales de por vida) de tus propios vídeos
  // publicados dentro de cada periodo. No es un dato de la API, es un cálculo local.
  const limites = calcularLimitesRango(rango);
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
    { vistas: number; likes: number; comentarios: number; miniatura: string | null }
  >();

  if (lista.length > 0) {
    try {
      const ids = lista.map((p) => p.tiktok_video_id as string);
      const resultados = await Promise.all(
        chunk(ids, 20).map((grupo) => obtenerEstadisticasVideos(grupo, accessToken))
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
      // Sin agregado del periodo si falla — las estadísticas de cuenta se muestran igual.
    }
  }

  const destacados = lista
    .map((p) => ({
      videoId: p.tiktok_video_id as string,
      titulo: p.titulo,
      url: p.url_publicado,
      stats: statsPorId.get(p.tiktok_video_id as string),
    }))
    .filter((v): v is typeof v & { stats: NonNullable<typeof v.stats> } => v.stats != null)
    .sort((a, b) => b.stats.vistas - a.stats.vistas)
    .slice(0, 10);

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
      { vistas: 0, likes: 0, comentarios: 0 }
    );

  const actual = acumular(limites.actualDesde, limites.actualHasta);
  const anterior =
    limites.anteriorDesde && limites.anteriorHasta
      ? acumular(limites.anteriorDesde, limites.anteriorHasta)
      : null;
  const hayComparativa = statsPorId.size > 0;

  const contarVideos = (desde: string, hasta: string) =>
    lista.filter((p) => {
      const fecha = p.fecha_publicacion as string;
      return fecha >= desde && fecha <= hasta;
    }).length;

  const videosActual = contarVideos(limites.actualDesde, limites.actualHasta);
  const videosAnterior =
    limites.anteriorDesde && limites.anteriorHasta
      ? contarVideos(limites.anteriorDesde, limites.anteriorHasta)
      : null;

  return (
    <div className="flex flex-col gap-6">
      {(hayComparativa || estadisticasCuenta) && (
        <div className="flex flex-col gap-3">
          {hayComparativa && (
            <p className="text-caption text-text-disabled">
              Suma de tus vídeos publicados en cada periodo — TikTok no da un total de cuenta por
              fechas.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {hayComparativa && (
              <>
                <StatMes
                  etiqueta="Vistas"
                  actual={actual.vistas}
                  anterior={anterior?.vistas ?? null}
                />
                <StatMes etiqueta="Vídeos" actual={videosActual} anterior={videosAnterior} />
                <StatMes
                  etiqueta="Comentarios"
                  actual={actual.comentarios}
                  anterior={anterior?.comentarios ?? null}
                />
                <StatMes etiqueta="Likes" actual={actual.likes} anterior={anterior?.likes ?? null} />
              </>
            )}
            {estadisticasCuenta && (
              <StatMes etiqueta="Seguidores" actual={estadisticasCuenta.seguidores} anterior={null} />
            )}
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
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
            {destacados.map((video) => (
              <a
                key={video.videoId}
                href={video.url ?? `https://www.tiktok.com/video/${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex h-40 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-md bg-neutral-bg"
              >
                {video.stats.miniatura && (
                  <Image
                    src={video.stats.miniatura}
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
                <div className="relative z-10 flex flex-col gap-0.5 p-2">
                  <p className="line-clamp-2 text-caption font-medium text-white">
                    {video.titulo}
                  </p>
                  <p className="truncate text-caption text-white/70">
                    {formatoNumero(video.stats.vistas)} vistas
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
