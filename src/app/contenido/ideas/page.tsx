import Link from "next/link";
import { ChevronRight, Clock, Lightbulb } from "lucide-react";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, isPlataforma, type Plataforma } from "@/lib/plataformas";
import { ESTADOS_IDEA, PILAR_LABEL } from "@/lib/contenido";

export const dynamic = "force-dynamic";

const DIAS_OLVIDO = 30;

function diasDesde(fechaISO: string) {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
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
      }`}
      style={
        olvidada
          ? {
              backgroundImage: "linear-gradient(var(--warning-bg), var(--warning-bg))",
              border: "1px solid rgba(255,220,168,0.5)",
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3 lg:gap-3.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm lg:h-9 lg:w-9"
          style={{ backgroundColor: tono }}
        >
          <Icon size={16} strokeWidth={1.5} className="text-white lg:h-[18px] lg:w-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-h2 truncate">{idea.titulo}</span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-caption text-text-secondary">{PLATAFORMA_LABEL[plataforma]}</span>
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
        <ChevronRight size={16} strokeWidth={1.5} className="mt-1 shrink-0 text-text-disabled" />
      </div>

      {olvidada && (
        <span className="text-caption text-warning flex items-center gap-1.5">
          <Clock size={14} strokeWidth={1.5} />
          Olvidada · hace {dias} días
        </span>
      )}
    </Link>
  );
}

export default async function IdeasGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const supabase = await createClient();
  const { p } = await searchParams;
  const filtro = p && isPlataforma(p) ? p : null;

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
  const plataformasConIdeas = [...new Set(todas.map((i) => i.plataforma))].filter(isPlataforma);
  const ideas = filtro ? todas.filter((i) => i.plataforma === filtro) : todas;
  const activas = ideas.filter((i) => i.estado === "idea");
  const descartadas = ideas.filter((i) => i.estado === "descartada");
  const olvidadas = activas.filter((i) => diasDesde(i.created_at) >= DIAS_OLVIDO).length;

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex items-end justify-between gap-3 px-1">
        <p className="text-caption text-text-secondary lg:text-body">
          {activas.length} {activas.length === 1 ? "guardada" : "guardadas"}
          {olvidadas > 0 && ` · ${olvidadas} ${olvidadas === 1 ? "olvidada" : "olvidadas"}`}
        </p>
        {filtro ? (
          <Link
            href={`/contenido/${filtro}/ideas/nueva`}
            className="text-caption text-accent lg:text-body"
          >
            + Nueva idea
          </Link>
        ) : (
          descartadas.length === 0 &&
          activas.length > 0 && (
            <span className="text-caption text-text-secondary rounded-full bg-neutral-bg px-2.5 py-1">
              Sin descartar
            </span>
          )
        )}
      </div>

      {plataformasConIdeas.length > 1 && (
        <div className="flex flex-wrap gap-2 lg:gap-2.5">
          <Link
            href="/contenido/ideas"
            className={`text-caption rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
              filtro ? "bg-neutral-bg text-text-secondary" : "bg-accent text-white"
            }`}
          >
            Todas
          </Link>
          {plataformasConIdeas.map((plataforma) => (
            <Link
              key={plataforma}
              href={`/contenido/ideas?p=${plataforma}`}
              className={`text-caption flex items-center gap-1.5 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
                filtro === plataforma ? "bg-accent text-white" : "bg-neutral-bg text-text-secondary"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PLATAFORMA_TONO[plataforma] }}
              />
              {PLATAFORMA_LABEL[plataforma]}
            </Link>
          ))}
        </div>
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
            <span className="text-caption text-text-disabled">{activas.length}</span>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
            {activas.map((idea, index) => (
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
            <span className="text-caption text-text-disabled">{descartadas.length}</span>
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
              {filtro ? "Sin ideas en esta plataforma" : "Todavía no hay ideas guardadas"}
            </h2>
            <p className="text-small text-text-secondary">
              Apúntala en cuanto se te ocurra, antes de que se te olvide.
            </p>
          </div>
          {(filtro ?? plataformasActivas[0]) && (
            <Link
              href={`/contenido/${filtro ?? plataformasActivas[0]}/ideas/nueva`}
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
