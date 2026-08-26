import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import {
  obtenerCanalPropio,
  obtenerComparativaMensual,
  obtenerEstadisticasCanal,
  type MetricasPeriodo,
} from "@/lib/youtube/oauth";
import { StatMes } from "@/components/StatMesComparativa";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
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
  let error = false;

  try {
    [canal, generales] = await Promise.all([
      obtenerCanalPropio(accessToken),
      obtenerEstadisticasCanal(accessToken),
    ]);
    comparativa = await obtenerComparativaMensual(accessToken).catch(() => null);
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
              etiqueta="Suscriptores ganados"
              actual={comparativa.actual.suscriptoresGanados}
              anterior={comparativa.anterior?.suscriptoresGanados ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
