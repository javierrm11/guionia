import Link from "next/link";
import { Clock, Lightbulb } from "lucide-react";
import { Badge } from "@/components/Badge";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, isPlataforma, type Plataforma } from "@/lib/plataformas";
import { ESTADOS_IDEA, ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, PILAR_LABEL } from "@/lib/contenido";

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

function TarjetaIdea({ idea }: { idea: Idea }) {
  const plataforma = idea.plataforma as Plataforma;
  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];
  const dias = diasDesde(idea.created_at);
  const olvidada = dias >= DIAS_OLVIDO;

  return (
    <Link
      href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
      className="flex flex-col gap-3 rounded-md bg-bg-primary p-3.5 hover:bg-accent-bg active:bg-accent-bg"
      style={
        olvidada
          ? {
              backgroundImage: "linear-gradient(var(--warning-bg), var(--warning-bg))",
              border: "1px solid rgba(255,220,168,0.5)",
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: tono }}
        >
          <Icon size={16} strokeWidth={1.5} className="text-white" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-h2">{idea.titulo}</span>
          <span className="text-caption text-text-secondary">
            {PLATAFORMA_LABEL[plataforma]}
            {" · "}
            {idea.pilar ? PILAR_LABEL[idea.pilar] : "Sin pilar"}
            {!olvidada && ` · hace ${dias} ${dias === 1 ? "día" : "días"}`}
          </span>
        </span>
        <span className="shrink-0">
          <Badge tone={ESTADO_PIEZA_TONE[idea.estado]}>{ESTADO_PIEZA_LABEL[idea.estado]}</Badge>
        </span>
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

  const { data } = await supabase
    .from("piezas_contenido")
    .select("*")
    .in("estado", ESTADOS_IDEA)
    .order("created_at", { ascending: false });

  const todas = (data ?? []) as Idea[];
  const plataformasConIdeas = [...new Set(todas.map((i) => i.plataforma))].filter(isPlataforma);
  const ideas = filtro ? todas.filter((i) => i.plataforma === filtro) : todas;
  const activas = ideas.filter((i) => i.estado === "idea");
  const descartadas = ideas.filter((i) => i.estado === "descartada");
  const olvidadas = activas.filter((i) => diasDesde(i.created_at) >= DIAS_OLVIDO).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-h1">Ideas</h1>
          <p className="text-caption text-text-secondary">
            {activas.length} {activas.length === 1 ? "guardada" : "guardadas"}
            {olvidadas > 0 && ` · ${olvidadas} ${olvidadas === 1 ? "olvidada" : "olvidadas"}`}
          </p>
        </div>
        {descartadas.length === 0 && activas.length > 0 && (
          <span className="text-caption text-text-secondary rounded-full bg-neutral-bg px-2.5 py-1">
            Sin descartar
          </span>
        )}
      </div>

      {plataformasConIdeas.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contenido/ideas"
            className={`text-caption rounded-full px-3 py-1.5 ${
              filtro ? "bg-neutral-bg text-text-secondary" : "bg-accent text-white"
            }`}
          >
            Todas
          </Link>
          {plataformasConIdeas.map((plataforma) => (
            <Link
              key={plataforma}
              href={`/contenido/ideas?p=${plataforma}`}
              className={`text-caption flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
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
              className="text-h3 text-text-secondary uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              Activas
            </h2>
            <span className="text-caption text-text-disabled">{activas.length}</span>
          </div>
          <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2">
            {activas.map((idea) => (
              <TarjetaIdea key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      )}

      {descartadas.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 px-1">
            <h2
              className="text-h3 text-text-disabled uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              Descartadas
            </h2>
            <span className="text-caption text-text-disabled">{descartadas.length}</span>
          </div>
          {descartadas.map((idea) => (
            <Link
              key={idea.id}
              href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
              className="flex min-h-11 items-center gap-3 rounded-md bg-bg-primary px-3.5 py-2.5 opacity-70 hover:opacity-100 active:bg-accent-bg"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-h3 truncate">{idea.titulo}</span>
                <span className="text-caption text-text-secondary">
                  {PLATAFORMA_LABEL[idea.plataforma as Plataforma]} · hace{" "}
                  {diasDesde(idea.created_at)} días
                </span>
              </span>
              <span className="shrink-0">
                <Badge tone={ESTADO_PIEZA_TONE[idea.estado]}>
                  {ESTADO_PIEZA_LABEL[idea.estado]}
                </Badge>
              </span>
            </Link>
          ))}
        </section>
      )}

      {ideas.length === 0 && (
        <section className="flex flex-col items-start gap-3 rounded-md bg-bg-primary p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
            <Lightbulb size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">
              {filtro ? "Sin ideas en esta plataforma" : "Todavía no hay ideas guardadas"}
            </h2>
            <p className="text-small text-text-secondary">
              Captúralas desde Inicio en cuanto se te ocurran, antes de que se te olviden.
            </p>
          </div>
          <Link href="/contenido" className="text-small text-accent hover:underline">
            Ir a la captura rápida →
          </Link>
        </section>
      )}
    </div>
  );
}
