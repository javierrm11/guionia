import Link from "next/link";
import { Suspense } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Flame,
  Lightbulb,
  Link2,
  Plus,
  Target,
  Video,
} from "lucide-react";
import { AvisoRachaEnRiesgo } from "@/components/AvisoRachaEnRiesgo";
import { BarraCadencia } from "@/components/BarraCadencia";
import { CapturaIdeaInline } from "@/components/CapturaIdeaInline";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { CapturaFlotante } from "@/components/CapturaFlotante";
import { TendenciasCarrusel } from "@/components/TendenciasCarrusel";
import { TendenciasCarruselSkeleton } from "@/components/TendenciasCarruselSkeleton";
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
  getProgresoCadenciaSemanal,
  getRachaSemanas,
  getTareasHoy,
  getUltimasIdeas,
} from "@/lib/contenido";
import { guardarPlataformasActivas } from "../configuracion/plataformas/actions";

export const dynamic = "force-dynamic";

function diasDesde(fechaISO: string) {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
}

const UMBRAL_CUENTA_NUEVA_MS = 24 * 60 * 60 * 1000; // 24 horas

export default async function ContenidoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cuentaNueva = user
    ? new Date().getTime() - new Date(user.created_at).getTime() <
      UMBRAL_CUENTA_NUEVA_MS
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

  const cadenciaSemanal = (cadencia ?? []).filter(
    (c) => c.periodo === "semana",
  );

  const [progreso, tareas, racha, ultimasIdeas] = await Promise.all([
    getProgresoCadenciaSemanal(
      supabase,
      semanaInicio,
      semanaFin,
      cadenciaSemanal,
    ),
    getTareasHoy(supabase, plataformasActivas, hoy, diaSemanaHoy),
    getRachaSemanas(supabase, cadenciaSemanal, semanaInicio),
    getUltimasIdeas(supabase, plataformasActivas),
  ]);

  const objetivoSemana = progreso.reduce((suma, p) => suma + p.cantidad, 0);
  const hechasSemana = progreso.reduce((suma, p) => suma + p.hechas, 0);
  const hayCadencia = objetivoSemana > 0;
  const porcentajeCadencia = hayCadencia
    ? Math.round((hechasSemana / objetivoSemana) * 100)
    : 0;

  const diasRestantesSemana = 7 - diaSemanaHoy; // domingo (7) → 0 días restantes
  const pendientesRacha = progreso
    .filter((p) => p.hechas < p.cantidad)
    .map((p) => ({ plataforma: p.plataforma, faltan: p.cantidad - p.hechas }));

  const [tareaHero, ...tareasResto] = tareas;
  const tareasVisibles = tareasResto.slice(0, 5);
  const tareasOcultas = tareasResto.length - tareasVisibles.length;
  // "Quedan pocas horas" — a partir de las 20h se avisa con un tono sutil de
  // que el día se acaba y la tarea del hero sigue pendiente.
  const quedanPocasHoras = new Date().getHours() >= 20;

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Cabecera plana de color, en vez de la onda: se solapa con la
         `TopBar` (transparente aquí) tirando de ella hacia arriba con un
         margen negativo igual a su alto (56px) — mismo efecto visual que
         antes, sin el SVG ni el cálculo de altura por % de cadencia.
         `relative z-0` explícito (más bajo que el `z-10` de la propia
         `TopBar`) para que el buscador/icono de Tendencias, que se solapan
         en esa misma franja, se sigan pintando por encima del panel en vez
         de quedar tapados por él. Fuera del contenedor centrado de abajo
         para que en escritorio ocupe todo el ancho, no solo la columna de
         `max-w-6xl` — el contenido de dentro sí se centra a esa anchura. */}
      <div
        className="relative z-0 -mt-[72px] rounded-b-[32px] bg-accent pt-[92px] pb-6 lg:-mt-[88px] lg:rounded-b-[40px] lg:pt-[108px] lg:pb-8"
        data-tour="cadencia"
      >
        <div className="px-4 lg:mx-auto lg:w-full lg:max-w-7xl lg:px-6">
          {hayCadencia ? (
            <section className="flex flex-col items-center gap-1 lg:gap-2">
              <Link
                href="/contenido/plataformas?vista=calendario"
                className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white lg:mb-2 lg:gap-2 lg:px-4 lg:py-1.5 lg:text-body ${
                  racha >= 1 ? "animate-racha-brillo" : ""
                }`}
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
                  boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
                }}
              >
                <Flame
                  size={14}
                  strokeWidth={0}
                  fill="#FFFFFF"
                  className="lg:h-4 lg:w-4"
                />
                {racha} {racha === 1 ? "semana seguida" : "semanas seguidas"}
              </Link>
              <BarraCadencia porcentaje={porcentajeCadencia} />
              <span className="text-caption text-white/80 lg:text-body">
                de la cadencia semanal
              </span>
            </section>
          ) : (
            <p className="text-center font-display text-3xl leading-tight font-semibold text-white lg:text-5xl">
              Bienvenido a Guionia
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-8 lg:mx-auto lg:w-full lg:px-10 lg:pb-12">
        {!hayCadencia && (
          <>
            <Link
              href="/configuracion/cadencia"
              className="mt-6 mb-6 flex items-center gap-3.5 rounded-md border border-border bg-bg-primary p-4 lg:gap-4 lg:p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-bg lg:h-10 lg:w-10">
                <Target
                  size={16}
                  strokeWidth={1.5}
                  className="text-accent lg:h-[18px] lg:w-[18px]"
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-h3 lg:text-h2">
                  Define tu cadencia semanal
                </span>
                <span className="text-caption text-text-secondary lg:text-body">
                  Así sabremos cuánto tienes que publicar cada semana
                </span>
              </div>
              <ChevronRight
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-text-disabled"
              />
            </Link>

            <div
              data-tour="tiles"
              className="mb-6 grid grid-cols-3 gap-3 lg:gap-4"
            >
              <Tile
                href={`/contenido/${plataformasActivas[0]}/videos/nueva`}
                label="Nuevo vídeo"
                icon={Video}
                tono="ai"
              />
              <Tile
                href={`/contenido/${plataformasActivas[0]}/ideas/nueva`}
                label="Nueva idea"
                icon={Lightbulb}
                tono="accent"
              />
              <Tile
                href="/configuracion/plataformas"
                label="Conectar cuentas"
                icon={Link2}
                tono="success"
              />
            </div>
          </>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
          <div className="lg:col-span-2">
            {tareaHero && (
              <section className="flex flex-col gap-3 pt-6 pb-3 lg:gap-4 lg:pt-8 lg:pb-4">
                {(() => {
                  const Icon = tareaHero.plataforma
                    ? PLATAFORMA_ICON[tareaHero.plataforma]
                    : Plus;
                  const tono = tareaHero.plataforma
                    ? PLATAFORMA_TONO[tareaHero.plataforma]
                    : "var(--neutral)";

                  return (
                    <Link
                      href={tareaHero.href}
                      data-tour="hero"
                      className={`animate-tarjeta-entrada flex items-center gap-3.5 rounded-md p-5 shadow-md transition-opacity duration-150 hover:opacity-80 lg:gap-4 lg:p-6 ${
                        quedanPocasHoras
                          ? "border-l-4 border-warning bg-warning-bg"
                          : "bg-accent-bg"
                      }`}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm lg:h-14 lg:w-14"
                        style={{ backgroundColor: tono }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.5}
                          className="text-white lg:h-6 lg:w-6"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-caption font-semibold lg:text-body ${
                            quedanPocasHoras ? "text-warning" : "text-accent"
                          }`}
                        >
                          {quedanPocasHoras
                            ? "Quedan pocas horas"
                            : "Falta el guion"}
                        </span>
                        <p className="truncate text-h2 lg:text-h1">
                          {tareaHero.titulo}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        strokeWidth={1.5}
                        className="shrink-0 text-text-disabled"
                      />
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
                      <span className="text-caption text-text-disabled">
                        {tareasResto.length}
                      </span>
                    </div>

                    <div className="rounded-md bg-bg-primary px-4 shadow-sm lg:px-4.5">
                      {tareasVisibles.map((t, index) => {
                        const Icon = t.plataforma
                          ? PLATAFORMA_ICON[t.plataforma]
                          : Plus;
                        const tono = t.plataforma
                          ? PLATAFORMA_TONO[t.plataforma]
                          : "var(--neutral)";

                        return (
                          <Link
                            key={t.id}
                            href={t.href}
                            className={`flex items-center gap-3 py-3 opacity-70 transition-opacity duration-150 hover:opacity-100 lg:gap-3.5 lg:py-3.5 ${
                              index > 0 ? "border-t border-border" : ""
                            }`}
                          >
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm lg:h-10 lg:w-10"
                              style={{ backgroundColor: tono }}
                            >
                              <Icon
                                size={16}
                                strokeWidth={1.5}
                                className="text-white lg:h-[18px] lg:w-[18px]"
                              />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-body lg:text-h3">
                              {t.titulo}
                              {t.plataforma &&
                                ` · ${PLATAFORMA_LABEL[t.plataforma]}`}
                            </span>
                          </Link>
                        );
                      })}

                      {tareasOcultas > 0 && (
                        <Link
                          href="/contenido/plataformas?vista=calendario"
                          className="flex items-center gap-1 border-t border-border py-3 text-caption text-text-secondary lg:py-3.5 lg:text-body"
                        >
                          +{tareasOcultas} más hoy
                          <ChevronRight size={14} strokeWidth={2} />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {!tareaHero && hayCadencia && (
              <section className="flex flex-col gap-3 pt-6 pb-3 lg:gap-4 lg:pt-8 lg:pb-4">
                <div className="flex items-center gap-3.5 rounded-md bg-bg-primary p-5 lg:gap-4 lg:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-bg lg:h-14 lg:w-14">
                    <CalendarCheck
                      size={20}
                      strokeWidth={1.5}
                      className="text-success lg:h-6 lg:w-6"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-caption font-semibold text-text-secondary lg:text-body">
                      Hoy
                    </span>
                    <p className="text-h2 lg:text-h1">Nada que hacer hoy</p>
                  </div>
                </div>
              </section>
            )}

            {hayCadencia && (
              <div
                data-tour="tiles"
                className="grid grid-cols-3 gap-3 lg:gap-4"
              >
                <Tile
                  href={`/contenido/${plataformasActivas[0]}/ideas/nueva`}
                  label="Nueva idea"
                  icon={Lightbulb}
                  tono="accent"
                />
                <Tile
                  href={`/contenido/${plataformasActivas[0]}/videos/nueva`}
                  label="Nuevo vídeo"
                  icon={Video}
                  tono="ai"
                />
                <Tile
                  href="/contenido/plataformas?vista=calendario"
                  label="Calendario"
                  icon={CalendarDays}
                  tono="success"
                />
              </div>
            )}

            <Suspense fallback={<TendenciasCarruselSkeleton />}>
              <TendenciasCarrusel sangrado={false} />
            </Suspense>
          </div>

          <aside className="pt-8 lg:sticky lg:top-8 lg:col-span-1 lg:ml-8 ">
            {ultimasIdeas.length > 0 && (
              <section className="flex flex-col gap-3 rounded-md bg-ai-bg p-4 lg:gap-4 lg:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex items-center gap-1.5 text-caption font-display text-text-secondary uppercase lg:text-body"
                    style={{ letterSpacing: "0.06em" }}
                  >
                    <Lightbulb
                      size={14}
                      strokeWidth={1.5}
                      className="lg:h-4 lg:w-4"
                    />
                    Ideas
                  </span>
                  <CapturaIdeaInline
                    plataformas={plataformasActivas as Plataforma[]}
                  />
                </div>

                <div className="flex flex-col gap-2 lg:gap-2.5">
                  {ultimasIdeas.map((idea) => {
                    const Icon = PLATAFORMA_ICON[idea.plataforma];
                    const tono = PLATAFORMA_TONO[idea.plataforma];
                    const dias = diasDesde(idea.created_at);

                    return (
                      <Link
                        key={idea.id}
                        href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
                        className="flex items-center gap-3 rounded-md bg-bg-primary p-3 shadow-sm transition-shadow hover:shadow-md lg:gap-3.5 lg:p-3.5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm lg:h-10 lg:w-10"
                          style={{ backgroundColor: tono }}
                        >
                          <Icon
                            size={16}
                            strokeWidth={1.5}
                            className="text-white lg:h-[18px] lg:w-[18px]"
                          />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body lg:text-h3">
                          {idea.titulo}
                        </span>
                        <span className="shrink-0 text-caption text-text-disabled lg:text-small">
                          {dias === 0
                            ? "Hoy"
                            : `hace ${dias} ${dias === 1 ? "día" : "días"}`}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/contenido/ideas"
                  className="flex items-center gap-0.5 self-start text-caption text-text-secondary"
                >
                  Ver todas las ideas
                  <ChevronRight size={14} strokeWidth={2} />
                </Link>
              </section>
            )}

            {!hayCadencia &&
              tareas.length === 0 &&
              ultimasIdeas.length === 0 && (
                <section className="flex flex-col items-center gap-3 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
                    <Lightbulb
                      size={20}
                      strokeWidth={1.5}
                      className="text-accent"
                    />
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
          </aside>
        </div>
      </div>

      <CapturaFlotante plataformas={plataformasActivas as Plataforma[]} />
      <TourControl cuentaNueva={cuentaNueva} />
      <AvisoRachaEnRiesgo
        racha={racha}
        diasRestantes={diasRestantesSemana}
        pendientes={pendientesRacha}
      />
    </div>
  );
}
