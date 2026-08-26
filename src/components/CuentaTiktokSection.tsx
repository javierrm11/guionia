import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/tiktok/conexion";
import { obtenerCuentaPropia, obtenerEstadisticasVideos } from "@/lib/tiktok/oauth";
import { StatMes } from "@/components/StatMesComparativa";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

/** Fecha ISO (YYYY-MM-DD) del primer día de un mes, `desplaze` meses respecto al actual (0 = este mes). */
function inicioDeMes(desplaze: number): string {
  const fecha = new Date();
  fecha.setDate(1);
  fecha.setMonth(fecha.getMonth() + desplaze);
  return fecha.toISOString().slice(0, 10);
}

function chunk<T>(items: T[], tamano: number): T[][] {
  const grupos: T[][] = [];
  for (let i = 0; i < items.length; i += tamano) grupos.push(items.slice(i, i + tamano));
  return grupos;
}

export async function CuentaTiktokSection() {
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

  let cuenta;
  let error = false;
  try {
    cuenta = await obtenerCuentaPropia(accessToken);
  } catch {
    error = true;
  }

  if (error || !cuenta) {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-danger">
          No se pudieron cargar las estadísticas de TikTok ahora mismo. Si acabas de dar permiso de
          estadísticas, reconéctala desde Ajustes → Plataformas.
        </p>
      </div>
    );
  }

  // TikTok no tiene una API de analítica agregada — sumamos las estadísticas
  // (ya disponibles por vídeo) de tus propios vídeos publicados este mes y el anterior.
  const inicioAnterior = inicioDeMes(-1);
  const inicioActual = inicioDeMes(0);

  const { data: piezas } = await supabase
    .from("piezas_contenido")
    .select("tiktok_video_id, fecha_publicacion")
    .eq("plataforma", "tiktok")
    .eq("estado", "publicado")
    .not("tiktok_video_id", "is", null)
    .gte("fecha_publicacion", inicioAnterior);

  const lista = piezas ?? [];
  const statsPorId = new Map<string, { vistas: number; likes: number; comentarios: number }>();

  if (lista.length > 0) {
    try {
      const ids = lista.map((p) => p.tiktok_video_id as string);
      const resultados = await Promise.all(
        chunk(ids, 20).map((grupo) => obtenerEstadisticasVideos(grupo, accessToken))
      );
      for (const r of resultados) {
        for (const [id, s] of Object.entries(r)) {
          statsPorId.set(id, { vistas: s.vistas, likes: s.likes, comentarios: s.comentarios });
        }
      }
    } catch {
      // Sin agregado del mes si falla — las estadísticas de cuenta se muestran igual.
    }
  }

  const acumular = (desde: string, hasta?: string) =>
    lista.reduce(
      (total, p) => {
        const fecha = p.fecha_publicacion as string;
        if (fecha < desde || (hasta && fecha >= hasta)) return total;
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

  const actual = acumular(inicioActual);
  const anterior = acumular(inicioAnterior, inicioActual);
  const hayComparativa = statsPorId.size > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {cuenta.avatarUrl && (
          <Image
            src={cuenta.avatarUrl}
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-full"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-h3">{cuenta.displayName}</p>
          <p className="text-caption text-text-secondary">Cuenta de TikTok</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Seguidores</span>
          <span className="text-h2">{formatoNumero(cuenta.seguidores)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Likes totales</span>
          <span className="text-h2">{formatoNumero(cuenta.likesTotales)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
          <span className="text-caption text-text-secondary">Vídeos</span>
          <span className="text-h2">{formatoNumero(cuenta.videos)}</span>
        </div>
      </div>

      {hayComparativa && (
        <div className="flex flex-col gap-3">
          <span
            className="text-caption font-display text-text-secondary uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Este mes, respecto al anterior
          </span>
          <p className="text-caption text-text-disabled">
            Suma de tus vídeos publicados en cada mes — TikTok no da un total de cuenta por fechas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatMes etiqueta="Vistas" actual={actual.vistas} anterior={anterior.vistas} />
            <StatMes etiqueta="Comentarios" actual={actual.comentarios} anterior={anterior.comentarios} />
            <StatMes etiqueta="Likes" actual={actual.likes} anterior={anterior.likes} />
          </div>
        </div>
      )}
    </div>
  );
}
