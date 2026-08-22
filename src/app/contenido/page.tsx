import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { AnilloProgreso } from "@/components/AnilloProgreso";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
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
  type Plataforma,
} from "@/lib/plataformas";
import { getPiezasEnRiesgo, getProgresoCadenciaSemanal, pad2 } from "@/lib/contenido";
import { guardarPlataformasActivas } from "../configuracion/plataformas/actions";

export const dynamic = "force-dynamic";

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
}

/** Número de semana del año (aproximado, solo para la etiqueta de cabecera). */
function numeroSemana(fecha: Date) {
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha.getTime() - inicioAno.getTime()) / 86400000);
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
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
        <section className="flex flex-col gap-4 rounded-md bg-bg-primary p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
            <Lightbulb size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-h1">¿En qué plataformas subes contenido?</h1>
            <p className="text-small text-text-secondary">
              Elige las tuyas para empezar a controlar la cadencia.
            </p>
          </div>
          <PlataformasActivasForm
            activas={[]}
            action={guardarPlataformasActivas}
            submitLabel="Empezar"
          />
        </section>
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

  const [progreso, enRiesgo] = await Promise.all([
    getProgresoCadenciaSemanal(
      supabase,
      semanaInicio,
      semanaFin,
      (cadencia ?? []).filter((c) => c.periodo === "semana")
    ),
    getPiezasEnRiesgo(supabase, plataformasActivas, hoy),
  ]);

  const paraGrabarHoy = enRiesgo.filter((p) => p.fecha_publicacion === hoy);
  const atrasadasOProximas = enRiesgo.filter((p) => p.fecha_publicacion !== hoy);

  const objetivoSemana = progreso.reduce((suma, p) => suma + p.cantidad, 0);
  const hechasSemana = progreso.reduce((suma, p) => suma + p.hechas, 0);
  const porcentajeCadencia =
    objetivoSemana > 0 ? Math.round((hechasSemana / objetivoSemana) * 100) : 0;
  const progresoPorPlataforma = new Map(progreso.map((p) => [p.plataforma, p]));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Control</h1>
        <span className="text-caption rounded-full bg-neutral-bg px-2.5 py-1 text-text-secondary">
          Semana {numeroSemana(new Date())}
        </span>
      </div>

      <section className="flex items-center gap-5 rounded-md bg-bg-primary p-5">
        <AnilloProgreso hechas={hechasSemana} objetivo={objetivoSemana} size={96} grosor={9} />
        <div className="flex flex-col gap-0.5">
          <span className="text-h1 leading-none">{porcentajeCadencia}%</span>
          <span className="text-caption text-text-secondary">de la cadencia semanal</span>
        </div>
      </section>

      <section className="flex flex-col gap-0.5 rounded-md bg-bg-primary py-1">
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <span className="text-caption text-text-secondary uppercase" style={{ letterSpacing: "0.06em" }}>
            Plataformas
          </span>
          <span className="text-caption text-text-disabled">esta semana</span>
        </div>

        {plataformasActivas.map((p) => {
          const Icon = PLATAFORMA_ICON[p];
          const tono = PLATAFORMA_TONO[p];
          const prog = progresoPorPlataforma.get(p);
          const porcentaje = prog ? Math.min(100, (prog.hechas / Math.max(1, prog.cantidad)) * 100) : 0;

          return (
            <Link
              key={p}
              href={`/contenido/${p}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-bg active:bg-accent-bg"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: tono }}
              >
                <Icon size={16} strokeWidth={1.5} className="text-white" />
              </span>
              {prog ? (
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-body">{PLATAFORMA_LABEL[p]}</span>
                    <span className="text-small text-text-secondary">
                      {prog.hechas} de {prog.cantidad}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-bg">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-baseline justify-between gap-2">
                  <span className="text-body">{PLATAFORMA_LABEL[p]}</span>
                  <span className="text-caption text-text-disabled">Sin cadencia</span>
                </div>
              )}
            </Link>
          );
        })}
      </section>

      <section className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
        <div className="flex items-center gap-2">
          <span className="text-caption text-text-secondary uppercase" style={{ letterSpacing: "0.06em" }}>
            Hoy
          </span>
          {enRiesgo.length > 0 && (
            <span
              className="text-caption rounded-full px-2 py-0.5"
              style={{ backgroundColor: "var(--danger-bg)" }}
            >
              {enRiesgo.length}
            </span>
          )}
        </div>

        {enRiesgo.length === 0 ? (
          <p className="text-small text-text-secondary">Nada en riesgo por ahora.</p>
        ) : (
          <div className="flex flex-col">
            {[...paraGrabarHoy, ...atrasadasOProximas].map((p, index, arr) => {
              const atrasada = p.fecha_publicacion < hoy;
              return (
                <div key={p.id}>
                  <Link
                    href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                    className="flex min-h-10 items-center gap-2.5 hover:opacity-80"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: atrasada ? "var(--danger)" : "#FFFFFF" }}
                    />
                    <span className="flex-1 truncate text-body">{p.titulo}</span>
                    <span
                      className={`shrink-0 text-caption ${atrasada ? "text-danger" : "text-text-secondary"}`}
                    >
                      {p.fecha_publicacion === hoy
                        ? "Grabar"
                        : atrasada
                          ? "Atrasada"
                          : p.fecha_publicacion.slice(5)}
                    </span>
                  </Link>
                  {index < arr.length - 1 && <div className="h-px bg-white/10" />}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <CapturaRapidaForm plataformas={plataformasActivas as Plataforma[]} />
    </div>
  );
}
