import Link from "next/link";
import { Tile } from "@/components/Tile";
import { Badge } from "@/components/Badge";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaRapidaForm } from "@/components/CapturaRapidaForm";
import { createClient } from "@/lib/supabase/server";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  getMondayISO,
  getSundayISO,
  isPlataforma,
  todayISO,
} from "@/lib/plataformas";
import {
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  getIdeasOlvidadas,
  getPendientesDePublicar,
  getPiezasEnRiesgo,
  getProgresoCadenciaSemanal,
  pad2,
} from "@/lib/contenido";
import { guardarPlataformasActivas } from "../configuracion/plataformas/actions";

export const dynamic = "force-dynamic";

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
}

function diasDesde(fechaISO: string) {
  const dias = Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
  return dias;
}

export default async function ContenidoPage() {
  const supabase = await createClient();

  const { data: plataformasActivasData } = await supabase
    .from("plataformas_activas")
    .select("plataforma");
  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);

  if (plataformasActivas.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <h1 className="text-h1">¿En qué plataformas subes contenido?</h1>
        <PlataformasActivasForm
          activas={[]}
          action={guardarPlataformasActivas}
          submitLabel="Empezar"
        />
      </div>
    );
  }

  const hoy = todayISO();
  const semanaInicio = getMondayISO(new Date());
  const semanaFin = getSundayISO(semanaInicio);

  const { data: cadencia } = await supabase
    .from("cadencia_contenido")
    .select("*")
    .order("plataforma");

  const [progreso, pendientes, enRiesgo, ideasOlvidadas] = await Promise.all([
    getProgresoCadenciaSemanal(
      supabase,
      semanaInicio,
      semanaFin,
      (cadencia ?? []).filter((c) => c.periodo === "semana")
    ),
    getPendientesDePublicar(supabase, plataformasActivas),
    getPiezasEnRiesgo(supabase, plataformasActivas, hoy),
    getIdeasOlvidadas(supabase, plataformasActivas),
  ]);

  const paraGrabarHoy = enRiesgo.filter((p) => p.fecha_publicacion === hoy);
  const atrasadasOProximas = enRiesgo.filter((p) => p.fecha_publicacion !== hoy);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <section className="flex flex-col gap-4 rounded-md border border-border bg-bg-primary p-4">
        <h2 className="text-h2">Control mensual</h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-h3 text-text-secondary">Cadencia de esta semana</h3>
          {progreso.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {progreso.map((p) => {
                const completa = p.hechas >= p.cantidad;
                const porcentaje = Math.min(100, (p.hechas / p.cantidad) * 100);
                return (
                  <li key={p.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-body">
                      <span>{PLATAFORMA_LABEL[p.plataforma]}</span>
                      <span className={completa ? "text-success" : "text-text-secondary"}>
                        {p.hechas} de {p.cantidad}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-sm bg-neutral-bg">
                      <div
                        className={`h-1.5 rounded-sm ${completa ? "bg-success" : "bg-accent"}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    {p.nota && (
                      <span className="text-caption text-text-disabled">{p.nota}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-small text-text-disabled">Todavía no hay cadencia definida.</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        {plataformasActivas.map((p) => (
          <Tile
            key={p}
            href={`/contenido/${p}`}
            label={PLATAFORMA_LABEL[p]}
            icon={PLATAFORMA_ICON[p]}
          />
        ))}
      </div>

      <CapturaRapidaForm plataformas={plataformasActivas} />

      <div className="flex flex-col gap-1">
        <Link href="/contenido/ideas" className="self-start text-small text-accent hover:underline">
          Ver todas las ideas →
        </Link>
        <Link
          href="/contenido/publicados"
          className="self-start text-small text-accent hover:underline"
        >
          Ver archivo de publicados →
        </Link>
      </div>

      {(paraGrabarHoy.length > 0 || atrasadasOProximas.length > 0) && (
        <section className="flex flex-col gap-4 rounded-md border border-danger bg-danger-bg p-4">
          <h2 className="text-h2">Hoy</h2>

          {paraGrabarHoy.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-h3 text-text-secondary">Para grabar hoy</h3>
              <ul className="flex flex-col gap-2">
                {paraGrabarHoy.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-body">
                    <Link
                      href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                      className="truncate text-accent hover:underline"
                    >
                      {p.titulo}
                    </Link>
                    <span className="text-caption text-text-secondary">
                      {PLATAFORMA_LABEL[p.plataforma]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {atrasadasOProximas.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-h3 text-text-secondary">En riesgo</h3>
              <ul className="flex flex-col gap-2">
                {atrasadasOProximas.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-body">
                    <Link
                      href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                      className="truncate text-accent hover:underline"
                    >
                      {p.titulo}
                    </Link>
                    <span className="text-caption text-text-secondary">
                      {PLATAFORMA_LABEL[p.plataforma]} · {p.fecha_publicacion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {pendientes.length > 0 && (
        <section className="flex flex-col gap-3 rounded-md border border-border bg-bg-primary p-4">
          <h2 className="text-h2">Pendientes de publicar</h2>
          <ul className="flex flex-col gap-2">
            {pendientes.map((p) => {
              const [anio, mes, dia] = p.fecha_publicacion.split("-");
              return (
                <li key={p.id} className="flex items-center justify-between gap-2 text-body">
                  <Link
                    href={`/contenido/${p.plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${p.id}`}
                    className="truncate text-accent hover:underline"
                  >
                    {p.titulo}
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-caption text-text-secondary">
                      {PLATAFORMA_LABEL[p.plataforma]} · {p.fecha_publicacion}
                    </span>
                    <Badge tone={ESTADO_PIEZA_TONE[p.estado]}>
                      {ESTADO_PIEZA_LABEL[p.estado]}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {ideasOlvidadas.length > 0 && (
        <section className="flex flex-col gap-3 rounded-md border border-border bg-bg-primary p-4">
          <h2 className="text-h2">Ideas olvidadas</h2>
          <ul className="flex flex-col gap-2">
            {ideasOlvidadas.map((idea) => (
              <li key={idea.id} className="flex items-center justify-between gap-2 text-body">
                <Link
                  href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
                  className="truncate text-accent hover:underline"
                >
                  {idea.titulo}
                </Link>
                <span className="text-caption text-text-secondary">
                  {PLATAFORMA_LABEL[idea.plataforma]} · hace {diasDesde(idea.created_at)} días
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
