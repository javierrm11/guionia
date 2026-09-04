import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, ChevronRight, Flame, Lightbulb, Link2, Plus, Video } from "lucide-react";
import { Badge } from "@/components/Badge";
import { BarraCadencia } from "@/components/BarraCadencia";
import { CapturaIdeaInline } from "@/components/CapturaIdeaInline";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaFlotante } from "@/components/CapturaFlotante";
import { TendenciasCarrusel } from "@/components/TendenciasCarrusel";
import { Tile } from "@/components/Tile";
import { TourControl } from "@/components/TourControl";
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

function diasDesde(fechaISO: string) {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
}

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
}

/** Qué toca hacer a continuación con una pieza real, según su estado —
 *  mismo criterio que ya usaba el badge de "Hoy": guion escrito → toca
 *  grabar, grabado → toca editar, editado → toca publicar. */
const VERBO_SIGUIENTE: Record<string, string> = {
  guion_escrito: "Toca grabar",
  grabado: "Toca editar",
  editado: "Toca publicar",
};

type Tarea = {
  id: string;
  titulo: string;
  plataforma: Plataforma | null;
  /** `null` = entrada de plantilla, sin pieza real todavía. */
  estado: string | null;
  href: string;
};

const UMBRAL_CUENTA_NUEVA_MS = 24 * 60 * 60 * 1000; // 24 horas

export default async function ContenidoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cuentaNueva = user
    ? new Date().getTime() - new Date(user.created_at).getTime() < UMBRAL_CUENTA_NUEVA_MS
    : false;

  const { data: plataformasActivasData } = await supabase
    .from("plataformas_activas")
    .select("plataforma");
  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);

  if (plataformasActivas.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <section className="flex flex-col gap-4 rounded-md border border-border p-6">
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

  // Las piezas reales van primero — así el hero prioriza una pieza ya en
  // curso sobre una entrada de plantilla que todavía no tiene nada empezado.
  const tareas: Tarea[] = [
    ...paraHoy.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      plataforma: p.plataforma,
      estado: p.estado,
      href: hrefVideo(p.plataforma, p.fecha_publicacion, p.id),
    })),
    ...plantillaHoy.map((entrada) => ({
      id: entrada.id,
      titulo: entrada.nota,
      plataforma: entrada.plataforma,
      estado: null,
      href: entrada.plataforma
        ? `/contenido/${entrada.plataforma}/videos/nueva?fecha=${hoy}`
        : "/configuracion/plantilla",
    })),
  ];
  const [tareaHero, ...tareasResto] = tareas;

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 z-0 lg:origin-top lg:scale-y-110"
        style={{ top: -56 }}
      >
        <OndaCadencia porcentaje={porcentajeCadencia} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-4 pt-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      {hayCadencia ? (
        <section data-tour="cadencia" className="flex flex-col items-center gap-1 pb-4 lg:gap-2 lg:pb-6">
          <Link
            href="/contenido/plataformas?vista=calendario"
            className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white lg:mb-2 lg:gap-2 lg:px-4 lg:py-1.5 lg:text-body ${
              racha >= 1 ? "animate-racha-brillo" : ""
            }`}
            style={{
              backgroundImage: "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
              boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
            }}
          >
            <Flame size={14} strokeWidth={0} fill="#FFFFFF" className="lg:h-4 lg:w-4" />
            {racha} {racha === 1 ? "semana seguida" : "semanas seguidas"}
          </Link>
          <BarraCadencia porcentaje={porcentajeCadencia} />
          <span className="text-caption text-white/80 lg:text-body">de la cadencia semanal</span>
        </section>
      ) : (
        <>
          <p className="pt-2 pb-6 text-center font-display text-3xl leading-tight font-semibold text-white lg:pt-4 lg:pb-8 lg:text-5xl">
            Bienvenido a Guionia
          </p>
          <Link
            href="/configuracion/cadencia"
            className="mb-6 flex items-center justify-between rounded-md border border-border p-4 lg:p-5"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-h3 lg:text-h2">Define tu cadencia semanal</span>
              <span className="text-caption text-text-secondary lg:text-body">
                Así sabremos cuánto tienes que publicar cada semana
              </span>
            </div>
            <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
          </Link>

          <div data-tour="tiles" className="mb-6 grid grid-cols-3 gap-3 lg:gap-4">
            <Tile
              href={`/contenido/${plataformasActivas[0]}/videos/nueva`}
              label="Nuevo vídeo"
              icon={Video}
            />
            <Tile
              href={`/contenido/${plataformasActivas[0]}/ideas/nueva`}
              label="Nueva idea"
              icon={Lightbulb}
            />
            <Tile href="/configuracion/plataformas" label="Conectar cuentas" icon={Link2} />
          </div>
        </>
      )}

      {tareaHero && (
        <section className="flex flex-col gap-3 pt-6 pb-3 lg:gap-4 lg:pt-8 lg:pb-4">
          {(() => {
            const Icon = tareaHero.plataforma ? PLATAFORMA_ICON[tareaHero.plataforma] : Plus;
            const tono = tareaHero.plataforma
              ? PLATAFORMA_TONO[tareaHero.plataforma]
              : "var(--neutral)";
            const etiqueta = tareaHero.estado
              ? (VERBO_SIGUIENTE[tareaHero.estado] ?? ESTADO_PIEZA_LABEL[tareaHero.estado])
              : "Publicar hoy";

            return (
              <Link
                href={tareaHero.href}
                data-tour="hero"
                className="animate-tarjeta-entrada flex items-center gap-3.5 rounded-md bg-bg-primary p-5 hover:bg-neutral-bg active:bg-neutral-bg lg:gap-4 lg:p-6"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm lg:h-14 lg:w-14"
                  style={{ backgroundColor: tono }}
                >
                  <Icon size={20} strokeWidth={1.5} className="text-white lg:h-6 lg:w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-caption font-semibold text-accent lg:text-body">
                    {etiqueta}
                  </span>
                  <p className="truncate text-h2 lg:text-h1">{tareaHero.titulo}</p>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
              </Link>
            );
          })()}

          {tareasResto.length > 0 && (
            <div className="flex flex-col pt-1">
              <div className="flex items-center gap-2 px-1 pb-2">
                <span
                  className="text-caption font-display text-text-secondary uppercase"
                  style={{ letterSpacing: "0.06em" }}
                >
                  Más para hoy
                </span>
                <span className="text-caption text-text-disabled">{tareasResto.length}</span>
              </div>

              {tareasResto.map((t, index) => {
                const Icon = t.plataforma ? PLATAFORMA_ICON[t.plataforma] : Plus;
                const tono = t.plataforma ? PLATAFORMA_TONO[t.plataforma] : "var(--neutral)";
                const pendiente = t.estado === null;

                return (
                  <Link
                    key={t.id}
                    href={t.href}
                    className={`flex items-center gap-3 py-3 hover:opacity-70 lg:gap-3.5 lg:py-3.5 ${
                      index > 0 ? "border-t border-border" : ""
                    } ${pendiente ? "opacity-70 hover:opacity-100" : ""}`}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm lg:h-10 lg:w-10"
                      style={{ backgroundColor: tono }}
                    >
                      <Icon size={16} strokeWidth={1.5} className="text-white lg:h-[18px] lg:w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body lg:text-h3">
                      {t.titulo}
                      {pendiente && t.plataforma && ` · ${PLATAFORMA_LABEL[t.plataforma]}`}
                    </span>
                    {t.estado && (
                      <Badge tone={ESTADO_PIEZA_TONE[t.estado]}>{ESTADO_PIEZA_LABEL[t.estado]}</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!hayCadencia && tareas.length === 0 && ultimasIdeas.length === 0 && (
        <section className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
            <Lightbulb size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-h3">Aún no tienes nada por aquí</p>
            <p className="text-small text-text-secondary">
              Crea tu primera idea o vídeo para empezar.
            </p>
          </div>
          <Link
            href={`/contenido/${plataformasActivas[0]}/ideas/nueva`}
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Nueva idea
          </Link>
        </section>
      )}

      {hayCadencia && (
        <div data-tour="tiles" className="grid grid-cols-3 gap-3 lg:gap-4">
          <Tile
            href={`/contenido/${plataformasActivas[0]}/ideas/nueva`}
            label="Nueva idea"
            icon={Lightbulb}
          />
          <Tile
            href={`/contenido/${plataformasActivas[0]}/videos/nueva`}
            label="Nuevo vídeo"
            icon={Video}
          />
          <Tile href="/contenido/plataformas?vista=calendario" label="Calendario" icon={CalendarDays} />
        </div>
      )}

      <Suspense fallback={null}>
        <TendenciasCarrusel />
      </Suspense>

      {ultimasIdeas.length > 0 && (
        <section className="flex flex-col gap-3 border-b border-border pt-8 pb-6 lg:gap-4 lg:pt-10 lg:pb-8">
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-caption font-display text-text-secondary uppercase lg:text-body"
              style={{ letterSpacing: "0.06em" }}
            >
              <Lightbulb size={14} strokeWidth={1.5} className="lg:h-4 lg:w-4" />
              Ideas
            </span>
            <div className="flex items-center gap-3">
              <CapturaIdeaInline plataformas={plataformasActivas as Plataforma[]} />
              <Link
                href="/contenido/ideas"
                className="flex items-center gap-0.5 text-caption text-text-secondary"
              >
                Ver todas
                <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            {ultimasIdeas.map((idea, index) => {
              const Icon = PLATAFORMA_ICON[idea.plataforma];
              const tono = PLATAFORMA_TONO[idea.plataforma];
              const dias = diasDesde(idea.created_at);

              return (
                <Link
                  key={idea.id}
                  href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
                  className={`flex items-center gap-2.5 py-3 hover:opacity-70 lg:gap-3 lg:py-3.5 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm lg:h-8 lg:w-8"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-white lg:h-4 lg:w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body lg:text-h3">{idea.titulo}</span>
                  <span className="shrink-0 text-caption text-text-disabled lg:text-small">
                    {dias === 0 ? "Hoy" : `hace ${dias} ${dias === 1 ? "día" : "días"}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      </div>

      <CapturaFlotante plataformas={plataformasActivas as Plataforma[]} />
      <TourControl cuentaNueva={cuentaNueva} />
    </div>
  );
}
