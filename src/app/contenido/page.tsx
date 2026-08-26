import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { GaugeCadencia } from "@/components/GaugeCadencia";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaFlotante } from "@/components/CapturaFlotante";
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

  const atrasadas = enRiesgo.filter((p) => p.fecha_publicacion < hoy);

  const objetivoSemana = progreso.reduce((suma, p) => suma + p.cantidad, 0);
  const hechasSemana = progreso.reduce((suma, p) => suma + p.hechas, 0);
  const porcentajeCadencia =
    objetivoSemana > 0 ? Math.round((hechasSemana / objetivoSemana) * 100) : 0;
  const progresoPorPlataforma = new Map(progreso.map((p) => [p.plataforma, p]));

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 z-0" style={{ top: -56 }}>
        <OndaCadencia porcentaje={porcentajeCadencia} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-4 pt-10 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <section className="flex flex-col items-center gap-1 pb-7">
        <GaugeCadencia porcentaje={porcentajeCadencia} />
        <span className="text-caption text-white/80">de la cadencia semanal</span>
      </section>

      <div className="border-b border-border py-6">
        <span className="text-caption font-display text-text-secondary uppercase" style={{ letterSpacing: "0.06em" }}>
          Plataformas
        </span>

        <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-4">
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

      {atrasadas.length > 0 && (
        <section className="flex flex-col gap-3 border-b border-border py-6">
          <div className="flex items-center gap-2">
            <span className="text-caption font-display text-danger uppercase" style={{ letterSpacing: "0.06em" }}>
              Atrasadas
            </span>
            <span className="text-caption rounded-full bg-neutral-bg px-2 py-0.5 text-text-primary">
              {atrasadas.length}
            </span>
          </div>

          <div className="flex flex-col">
            {atrasadas.map((p, index) => (
              <Link
                key={p.id}
                href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                className={`flex min-h-10 items-center gap-2.5 hover:opacity-70 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                <span className="flex-1 truncate text-body">{p.titulo}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      </div>

      <CapturaFlotante plataformas={plataformasActivas as Plataforma[]} />
    </div>
  );
}
