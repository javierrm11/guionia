import Link from "next/link";
import { AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/Badge";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaFlotante } from "@/components/CapturaFlotante";
import { createClient } from "@/lib/supabase/server";
import {
  DIA_SEMANA_LABEL,
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  addDaysISO,
  getMondayISO,
  getSundayISO,
  isPlataforma,
  todayISO,
  type Plataforma,
} from "@/lib/plataformas";
import {
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  getPiezasEnRiesgo,
  getPiezasSemana,
  getProgresoCadenciaSemanal,
  pad2,
  type PiezaSemana,
} from "@/lib/contenido";
import { guardarPlataformasActivas } from "../configuracion/plataformas/actions";

export const dynamic = "force-dynamic";

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
}

/** Fila compacta de una pieza dentro de un día (todo menos "grabar hoy"). */
function FilaPieza({ pieza, atrasada }: { pieza: PiezaSemana; atrasada: boolean }) {
  const plataforma = pieza.plataforma as Plataforma;
  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];

  return (
    <Link
      href={hrefVideo(pieza.plataforma, pieza.fecha_publicacion, pieza.id)}
      className="flex min-h-11 items-center gap-3 rounded-md bg-bg-primary px-3.5 py-3 hover:bg-accent-bg active:bg-accent-bg"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tono }}
      >
        <Icon size={14} strokeWidth={1.5} className="text-white" />
      </span>

      {atrasada ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-body truncate">{pieza.titulo}</span>
          <span className="text-caption text-danger">Sin grabar · atrasada</span>
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-body truncate">{pieza.titulo}</span>
          {pieza.estado !== "publicado" && (
            <span className="text-caption text-text-secondary">
              {PLATAFORMA_LABEL[plataforma]}
            </span>
          )}
        </span>
      )}

      <span className="shrink-0">
        <Badge tone={ESTADO_PIEZA_TONE[pieza.estado]}>{ESTADO_PIEZA_LABEL[pieza.estado]}</Badge>
      </span>
    </Link>
  );
}

/** Tarjeta destacada de una pieza que toca grabar hoy. */
function TarjetaGrabarHoy({ pieza }: { pieza: PiezaSemana }) {
  const plataforma = pieza.plataforma as Plataforma;
  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];

  return (
    <div
      className="flex flex-col gap-3 rounded-md bg-bg-primary p-4"
      style={{
        backgroundImage: "linear-gradient(var(--danger-bg), var(--danger-bg))",
        border: "1px solid rgba(255,177,153,0.55)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: tono }}
        >
          <Icon size={14} strokeWidth={1.5} className="text-white" />
        </span>
        <span className="text-caption text-text-secondary uppercase" style={{ letterSpacing: "0.06em" }}>
          Grabar hoy
        </span>
      </div>
      <span className="text-h2">{pieza.titulo}</span>
      <Link
        href={hrefVideo(pieza.plataforma, pieza.fecha_publicacion, pieza.id)}
        className="flex min-h-11 items-center justify-center rounded-sm bg-accent text-body text-white active:bg-accent-hover"
      >
        Abrir guion
      </Link>
    </div>
  );
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

  const [progreso, piezasSemana, enRiesgo] = await Promise.all([
    getProgresoCadenciaSemanal(
      supabase,
      semanaInicio,
      semanaFin,
      (cadencia ?? []).filter((c) => c.periodo === "semana")
    ),
    getPiezasSemana(supabase, plataformasActivas, semanaInicio, semanaFin),
    getPiezasEnRiesgo(supabase, plataformasActivas, hoy),
  ]);

  const objetivoSemana = progreso.reduce((suma, p) => suma + p.cantidad, 0);
  const hechasSemana = progreso.reduce((suma, p) => suma + p.hechas, 0);
  const porcentajeCadencia =
    objetivoSemana > 0 ? Math.round((hechasSemana / objetivoSemana) * 100) : 0;
  const tramosLlenos = Math.max(0, Math.min(4, Math.round((porcentajeCadencia / 100) * 4)));

  const publicadasSemana = piezasSemana.filter((p) => p.estado === "publicado").length;

  const piezasPorDia = new Map<string, PiezaSemana[]>();
  for (const pieza of piezasSemana) {
    const lista = piezasPorDia.get(pieza.fecha_publicacion) ?? [];
    lista.push(pieza);
    piezasPorDia.set(pieza.fecha_publicacion, lista);
  }

  const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(semanaInicio, i));
  const diasVisibles = dias.filter((dia) => dia === hoy || piezasPorDia.has(dia));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-h1">Esta semana</h1>
          <p className="text-caption text-text-secondary">
            {piezasSemana.length > 0
              ? `${publicadasSemana} de ${piezasSemana.length} publicadas`
              : "Nada programado esta semana"}
            {enRiesgo.length > 0 && ` · ${enRiesgo.length} en riesgo`}
          </p>
        </div>
        <Link href="/contenido/publicados" className="text-caption text-accent hover:underline">
          Archivo →
        </Link>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i < tramosLlenos ? "var(--accent)" : "var(--neutral-bg)" }}
          />
        ))}
      </div>

      <div className="flex flex-col">
        {diasVisibles.map((dia, index) => {
          const esHoy = dia === hoy;
          const piezasDia = piezasPorDia.get(dia) ?? [];
          const esUltimo = index === diasVisibles.length - 1;
          const indiceSemana = dias.indexOf(dia);
          const hayPublicada = piezasDia.some((p) => p.estado === "publicado");
          const hayAtrasada = piezasDia.some(
            (p) => p.estado === "guion_escrito" && p.fecha_publicacion < hoy
          );
          const colorDia = hayPublicada ? "var(--success)" : hayAtrasada ? "var(--danger)" : "rgba(255,255,255,0.4)";

          return (
            <div key={dia} className="flex gap-3.5">
              <div className="flex w-11 shrink-0 flex-col items-center">
                {esHoy ? (
                  <span className="flex h-6 min-w-11 items-center justify-center rounded-full bg-accent px-2 text-caption text-white">
                    HOY
                  </span>
                ) : (
                  <>
                    <span className="text-caption text-text-secondary">
                      {DIA_SEMANA_LABEL[indiceSemana].slice(0, 3).toUpperCase()}
                    </span>
                    <span
                      className="mt-1.5 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorDia }}
                    />
                  </>
                )}
                {!esUltimo && <span className="w-0.5 flex-1 bg-neutral-bg" />}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 pb-4">
                {piezasDia.length > 0 ? (
                  piezasDia.map((pieza) =>
                    esHoy && pieza.estado === "guion_escrito" ? (
                      <TarjetaGrabarHoy key={pieza.id} pieza={pieza} />
                    ) : (
                      <FilaPieza
                        key={pieza.id}
                        pieza={pieza}
                        atrasada={pieza.estado === "guion_escrito" && pieza.fecha_publicacion < hoy}
                      />
                    )
                  )
                ) : (
                  <div className="flex min-h-11 items-center gap-3 rounded-md bg-bg-primary px-3.5 py-3 text-text-disabled">
                    <AlertCircle size={16} strokeWidth={1.5} />
                    <span className="text-small">Nada programado para hoy</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CapturaFlotante plataformas={plataformasActivas} />
    </div>
  );
}
