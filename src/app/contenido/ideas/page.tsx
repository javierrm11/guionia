import Link from "next/link";
import { ChevronRight, Clock, Lightbulb, Search } from "lucide-react";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  isPlataforma,
  type Plataforma,
} from "@/lib/plataformas";
import { ESTADOS_IDEA, PILAR_LABEL } from "@/lib/contenido";

export const dynamic = "force-dynamic";

const DIAS_OLVIDO = 30;
const MES_ABREV = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function diasDesde(fechaISO: string) {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
}

/** A partir de `DIAS_OLVIDO` una fecha relativa ("hace 47 días") deja de ser
 *  útil de un vistazo — se cambia a fecha real ("12 mar"). */
function formatoFechaOlvidada(fechaISO: string) {
  const fecha = new Date(fechaISO);
  return `${fecha.getDate()} ${MES_ABREV[fecha.getMonth()]}`;
}

type Idea = {
  id: string;
  titulo: string;
  plataforma: string;
  estado: string;
  pilar: string | null;
  created_at: string;
};

function TarjetaIdea({ idea, primera }: { idea: Idea; primera: boolean }) {
  const plataforma = idea.plataforma as Plataforma;
  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];
  const dias = diasDesde(idea.created_at);
  const olvidada = idea.estado === "idea" && dias >= DIAS_OLVIDO;
  const descartada = idea.estado === "descartada";

  return (
    <Link
      href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
      className={`flex flex-col gap-3 py-3.5 hover:opacity-70 ${primera ? "" : "border-t border-border"} ${
        descartada ? "opacity-70 hover:opacity-100" : ""
      } ${olvidada ? "-mx-3 rounded-md border border-warning/40 bg-warning-bg px-3" : ""}`}
    >
      <div className="flex items-start gap-3 lg:gap-3.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm lg:h-9 lg:w-9"
          style={{ backgroundColor: tono }}
        >
          <Icon
            size={16}
            strokeWidth={1.5}
            className="text-white lg:h-[18px] lg:w-[18px]"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-h2 truncate">{idea.titulo}</span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-caption text-text-secondary">
              {PLATAFORMA_LABEL[plataforma]}
            </span>
            {idea.pilar && (
              <span className="text-caption text-text-secondary rounded-full bg-neutral-bg px-2 py-0.5">
                {PILAR_LABEL[idea.pilar]}
              </span>
            )}
            {!olvidada && (
              <span className="text-caption text-text-disabled">
                hace {dias} {dias === 1 ? "día" : "días"}
              </span>
            )}
          </span>
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="mt-1 shrink-0 text-text-disabled"
        />
      </div>

      {olvidada && (
        <span className="text-caption text-warning flex items-center gap-1.5">
          <Clock size={14} strokeWidth={1.5} />
          Olvidada · {formatoFechaOlvidada(idea.created_at)}
        </span>
      )}
    </Link>
  );
}

export default async function IdeasGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; pilar?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { p, pilar: pilarParam, q } = await searchParams;

  const filtros = (p ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(isPlataforma);
  const pilarFiltro =
    pilarParam && pilarParam in PILAR_LABEL ? pilarParam : null;
  const busqueda = (q ?? "").trim().toLowerCase();

  const [{ data }, { data: plataformasActivasData }] = await Promise.all([
    supabase
      .from("piezas_contenido")
      .select("*")
      .in("estado", ESTADOS_IDEA)
      .order("created_at", { ascending: false }),
    supabase.from("plataformas_activas").select("plataforma"),
  ]);

  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);

  const todas = (data ?? []) as Idea[];
  const plataformasConIdeas = [
    ...new Set(todas.map((i) => i.plataforma)),
  ].filter(isPlataforma);
  const contarPlataforma = (plataforma: Plataforma) =>
    todas.filter((i) => i.plataforma === plataforma).length;

  const porPlataforma = filtros.length
    ? todas.filter((i) => filtros.includes(i.plataforma as Plataforma))
    : todas;
  const pilaresConIdeas = [
    ...new Set(
      porPlataforma.map((i) => i.pilar).filter((v): v is string => !!v),
    ),
  ];
  const contarPilar = (pilar: string) =>
    porPlataforma.filter((i) => i.pilar === pilar).length;

  const ideas = (
    pilarFiltro
      ? porPlataforma.filter((i) => i.pilar === pilarFiltro)
      : porPlataforma
  ).filter((i) => !busqueda || i.titulo.toLowerCase().includes(busqueda));
  const activas = ideas.filter((i) => i.estado === "idea");
  const descartadas = ideas.filter((i) => i.estado === "descartada");
  const olvidadas = activas.filter(
    (i) => diasDesde(i.created_at) >= DIAS_OLVIDO,
  ).length;

  // Las olvidadas suben arriba del todo (más urgente primero); dentro de
  // cada grupo se conserva el orden de la consulta (más reciente primero).
  const activasOrdenadas = [...activas].sort((a, b) => {
    const aOlvidada = diasDesde(a.created_at) >= DIAS_OLVIDO;
    const bOlvidada = diasDesde(b.created_at) >= DIAS_OLVIDO;
    if (aOlvidada !== bOlvidada) return aOlvidada ? -1 : 1;
    if (aOlvidada) return diasDesde(b.created_at) - diasDesde(a.created_at);
    return 0;
  });

  // href que añade/quita esta plataforma del filtro multi-selección,
  // conservando el resto de parámetros de la URL.
  const hrefTogglePlataforma = (plataforma: Plataforma) => {
    const siguiente = filtros.includes(plataforma)
      ? filtros.filter((f) => f !== plataforma)
      : [...filtros, plataforma];
    const params = new URLSearchParams();
    if (siguiente.length) params.set("p", siguiente.join(","));
    if (pilarFiltro) params.set("pilar", pilarFiltro);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/contenido/ideas${query ? `?${query}` : ""}`;
  };

  const hrefTogglePilar = (pilar: string) => {
    const params = new URLSearchParams();
    if (filtros.length) params.set("p", filtros.join(","));
    if (pilarFiltro !== pilar) params.set("pilar", pilar);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/contenido/ideas${query ? `?${query}` : ""}`;
  };

  const plataformaObjetivo =
    filtros.length === 1 ? filtros[0] : plataformasActivas[0];

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex items-end justify-between gap-3 px-1">
        <p className="text-caption text-text-secondary lg:text-body">
          {activas.length} {activas.length === 1 ? "guardada" : "guardadas"}
          {olvidadas > 0 &&
            ` · ${olvidadas} ${olvidadas === 1 ? "olvidada" : "olvidadas"}`}
        </p>
        <div className="flex items-center gap-2">
          {!filtros.length &&
            descartadas.length === 0 &&
            activas.length > 0 && (
              <span className="text-caption text-text-secondary rounded-full bg-neutral-bg px-2.5 py-1">
                Sin descartar
              </span>
            )}
          {plataformaObjetivo && (
            <Link
              href={`/contenido/${plataformaObjetivo}/ideas/nueva`}
              className="text-caption rounded-full bg-accent px-3 py-1.5 text-white active:bg-accent-hover lg:text-body"
            >
              + Nueva idea
            </Link>
          )}
        </div>
      </div>

      <form
        action="/contenido/ideas"
        className="flex items-center gap-2 border-b border-border px-1 pb-2"
      >
        {filtros.length > 0 && (
          <input type="hidden" name="p" value={filtros.join(",")} />
        )}
        {pilarFiltro && (
          <input type="hidden" name="pilar" value={pilarFiltro} />
        )}
        <Search
          size={16}
          strokeWidth={1.5}
          className="shrink-0 text-text-disabled"
        />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por título..."
          style={{ "--input-bg": "transparent" } as React.CSSProperties}
          className="w-full text-body text-text-primary placeholder:text-text-disabled focus:outline-none"
        />
      </form>

      {plataformasConIdeas.length > 1 && (
        <div className="flex flex-wrap gap-2 lg:gap-2.5">
          <Link
            href={(() => {
              const params = new URLSearchParams();
              if (pilarFiltro) params.set("pilar", pilarFiltro);
              if (q) params.set("q", q);
              const query = params.toString();
              return `/contenido/ideas${query ? `?${query}` : ""}`;
            })()}
            className={`text-caption rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
              filtros.length
                ? "bg-neutral-bg text-text-secondary"
                : "bg-accent text-white"
            }`}
          >
            Todas
          </Link>
          {plataformasConIdeas.map((plataforma) => (
            <Link
              key={plataforma}
              href={hrefTogglePlataforma(plataforma)}
              className={`text-caption flex items-center gap-1.5 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
                filtros.includes(plataforma)
                  ? "bg-accent text-white"
                  : "bg-neutral-bg text-text-secondary"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PLATAFORMA_TONO[plataforma] }}
              />
              {PLATAFORMA_LABEL[plataforma]}
              <span
                className={
                  filtros.includes(plataforma)
                    ? "text-white/70"
                    : "text-text-disabled"
                }
              >
                {contarPlataforma(plataforma)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {pilaresConIdeas.length > 1 && (
        <div className="flex flex-wrap gap-2 lg:gap-2.5">
          {pilaresConIdeas.map((pilar) => (
            <Link
              key={pilar}
              href={hrefTogglePilar(pilar)}
              className={`text-caption flex items-center gap-1 rounded-full px-3 py-1.5 lg:text-body ${
                pilarFiltro === pilar
                  ? "bg-accent text-white"
                  : "bg-neutral-bg text-text-secondary"
              }`}
            >
              {PILAR_LABEL[pilar] ?? pilar}
              <span
                className={
                  pilarFiltro === pilar ? "text-white/70" : "text-text-disabled"
                }
              >
                {contarPilar(pilar)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {activas.length === 0 && descartadas.length > 0 && (
        <p className="text-small text-text-secondary px-1">
          Sin ideas activas
          {filtros.length === 1 ? ` en ${PLATAFORMA_LABEL[filtros[0]]}` : ""} —
          pero tienes {descartadas.length}{" "}
          {descartadas.length === 1 ? "descartada" : "descartadas"}.
        </p>
      )}

      {activas.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 px-1">
            <h2
              className="text-caption font-display text-text-secondary uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              Activas
            </h2>
            <span className="text-caption text-text-disabled">
              {activas.length}
            </span>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
            {activasOrdenadas.map((idea, index) => (
              <TarjetaIdea key={idea.id} idea={idea} primera={index === 0} />
            ))}
          </div>
        </section>
      )}

      {descartadas.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 px-1">
            <h2
              className="text-caption font-display text-text-disabled uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              Descartadas
            </h2>
            <span className="text-caption text-text-disabled">
              {descartadas.length}
            </span>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
            {descartadas.map((idea, index) => (
              <TarjetaIdea key={idea.id} idea={idea} primera={index === 0} />
            ))}
          </div>
        </section>
      )}

      {ideas.length === 0 && (
        <section className="flex flex-col items-start gap-3 p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
            <Lightbulb size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">
              {busqueda
                ? "Sin resultados para esa búsqueda"
                : filtros.length || pilarFiltro
                  ? "Sin ideas con este filtro"
                  : "Todavía no hay ideas guardadas"}
            </h2>
            <p className="text-small text-text-secondary">
              Apúntala en cuanto se te ocurra, antes de que se te olvide.
            </p>
          </div>
          {plataformaObjetivo && (
            <Link
              href={`/contenido/${plataformaObjetivo}/ideas/nueva`}
              className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
            >
              + Nueva idea
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
