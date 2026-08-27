import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Flame, Lightbulb, Plus } from "lucide-react";
import { Badge } from "@/components/Badge";
import { GaugeCadencia } from "@/components/GaugeCadencia";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaFlotante } from "@/components/CapturaFlotante";
import { TendenciasCarrusel } from "@/components/TendenciasCarrusel";
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
import {
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  getPiezasParaHoy,
  getPlantillaDelDia,
  getProgresoCadenciaSemanal,
  getRachaSemanas,
  getUltimasIdeas,
  pad2,
} from "@/lib/contenido";
import { guardarPlataformasActivas } from "../configuracion/plataformas/actions";

export const dynamic = "force-dynamic";

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
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
  const diaSemanaHoy = ((new Date().getDay() + 6) % 7) + 1; // 1 = lunes ... 7 = domingo

  const { data: cadencia } = await supabase
    .from("cadencia_contenido")
    .select("*")
    .order("plataforma");

  const cadenciaSemanal = (cadencia ?? []).filter((c) => c.periodo === "semana");

  const [progreso, paraHoy, plantillaHoy, racha, ultimasIdeas] = await Promise.all([
    getProgresoCadenciaSemanal(supabase, semanaInicio, semanaFin, cadenciaSemanal),
    getPiezasParaHoy(supabase, plataformasActivas, hoy),
    getPlantillaDelDia(supabase, diaSemanaHoy),
    getRachaSemanas(supabase, cadenciaSemanal, semanaInicio),
    getUltimasIdeas(supabase, plataformasActivas),
  ]);

  const objetivoSemana = progreso.reduce((suma, p) => suma + p.cantidad, 0);
  const hechasSemana = progreso.reduce((suma, p) => suma + p.hechas, 0);
  const hayCadencia = objetivoSemana > 0;
  const porcentajeCadencia = hayCadencia ? Math.round((hechasSemana / objetivoSemana) * 100) : 0;
  const progresoPorPlataforma = new Map(progreso.map((p) => [p.plataforma, p]));

  return (
    <div className="relative flex flex-1 flex-col">
      {hayCadencia && (
        <div className="pointer-events-none absolute inset-x-0 z-0" style={{ top: -56 }}>
          <OndaCadencia porcentaje={porcentajeCadencia} />
        </div>
      )}

      <div
        className={`relative z-10 flex flex-1 flex-col p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8 ${hayCadencia ? "pt-4" : ""}`}
      >
      {hayCadencia ? (
        <section className="flex flex-col items-center gap-1 pb-7">
          <span
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white"
            style={{
              backgroundImage: "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
              boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
            }}
          >
            <Flame size={14} strokeWidth={0} fill="#FFFFFF" />
            {racha} {racha === 1 ? "semana seguida" : "semanas seguidas"}
          </span>
          <GaugeCadencia porcentaje={porcentajeCadencia} />
          <span className="text-caption text-white/80">de la cadencia semanal</span>
        </section>
      ) : (
        <Link
          href="/configuracion/cadencia"
          className="mb-6 flex items-center justify-between rounded-md bg-bg-primary p-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-h3">Define tu cadencia semanal</span>
            <span className="text-caption text-text-secondary">
              Así sabremos cuánto tienes que publicar cada semana
            </span>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
        </Link>
      )}

      {(paraHoy.length > 0 || plantillaHoy.length > 0) && (
        <section className="flex flex-col gap-3 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-small font-semibold text-white">
              Hoy
            </span>
            <span className="text-caption text-text-secondary">
              {paraHoy.length + plantillaHoy.length}{" "}
              {paraHoy.length + plantillaHoy.length === 1 ? "tarea" : "tareas"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {paraHoy.map((p) => {
              const Icon = PLATAFORMA_ICON[p.plataforma];
              const tono = PLATAFORMA_TONO[p.plataforma];

              return (
                <Link
                  key={p.id}
                  href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                  className="flex items-center gap-3 rounded-md bg-bg-primary p-3 hover:bg-accent-bg active:bg-accent-bg"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={16} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body">{p.titulo}</span>
                  <Badge tone={ESTADO_PIEZA_TONE[p.estado]}>{ESTADO_PIEZA_LABEL[p.estado]}</Badge>
                </Link>
              );
            })}
            {plantillaHoy.map((entrada) => {
              const Icon = entrada.plataforma ? PLATAFORMA_ICON[entrada.plataforma] : Plus;
              const tono = entrada.plataforma ? PLATAFORMA_TONO[entrada.plataforma] : "var(--neutral)";

              return (
                <Link
                  key={entrada.id}
                  href={
                    entrada.plataforma
                      ? `/contenido/${entrada.plataforma}/videos/nueva?fecha=${hoy}`
                      : "/configuracion/plantilla"
                  }
                  className="flex items-center gap-3 rounded-md bg-bg-primary p-3 opacity-70 hover:opacity-100 active:bg-accent-bg"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={16} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-text-secondary">
                    {entrada.nota}
                    {entrada.plataforma && ` · ${PLATAFORMA_LABEL[entrada.plataforma]}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="border-b border-border pt-3 pb-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {plataformasActivas.map((p) => {
            const Icon = PLATAFORMA_ICON[p];
            const tono = PLATAFORMA_TONO[p];
            const prog = progresoPorPlataforma.get(p);

            return (
              <Link key={p} href={`/contenido/${p}/videos`} className="flex items-center gap-2.5">
                <span
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: tono }}
                >
                  <Icon size={14} strokeWidth={1.5} className="text-white" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-small font-semibold text-text-primary">
                    {PLATAFORMA_LABEL[p]}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {prog ? `${prog.hechas} de ${prog.cantidad}` : "Sin cadencia"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Suspense fallback={null}>
        <TendenciasCarrusel />
      </Suspense>

      {ultimasIdeas.length > 0 && (
        <section className="flex flex-col gap-3 border-b border-border py-6">
          <div className="flex items-center justify-between">
            <span
              className="text-caption font-display text-text-secondary uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              Ideas
            </span>
            <Link href="/contenido/ideas" className="text-caption text-accent">
              Ver todas
            </Link>
          </div>

          <div className="flex flex-col">
            {ultimasIdeas.map((idea, index) => {
              const Icon = PLATAFORMA_ICON[idea.plataforma];
              const tono = PLATAFORMA_TONO[idea.plataforma];

              return (
                <Link
                  key={idea.id}
                  href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
                  className={`flex min-h-11 items-center gap-2.5 hover:opacity-70 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="flex-1 truncate text-body">{idea.titulo}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      </div>

      <CapturaFlotante plataformas={plataformasActivas as Plataforma[]} />
    </div>
  );
}
