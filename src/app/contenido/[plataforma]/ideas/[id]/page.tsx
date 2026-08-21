import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, PILAR_LABEL } from "@/lib/contenido";
import { SerieSection } from "@/components/SerieSection";
import { guardarEtiquetas } from "../../../_shared/etiquetasActions";
import { descartarIdea } from "../../../_shared/ideaEstadoActions";

export const dynamic = "force-dynamic";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ plataforma: string; id: string }>;
}) {
  const { plataforma, id } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const supabase = await createClient();

  const { data: idea } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("id", id)
    .eq("plataforma", plataforma)
    .maybeSingle();

  if (!idea) notFound();

  const rutaActual = `/contenido/${plataforma}/ideas/${idea.id}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <p className="text-h2">{idea.titulo}</p>

      <div className="flex items-center gap-2">
        <Badge tone={ESTADO_PIEZA_TONE[idea.estado]}>{ESTADO_PIEZA_LABEL[idea.estado]}</Badge>
        {idea.pilar && (
          <span className="text-small text-text-secondary">{PILAR_LABEL[idea.pilar]}</span>
        )}
      </div>

      <form action={guardarEtiquetas} className="flex flex-col gap-1">
        <input type="hidden" name="id" value={idea.id} />
        <input type="hidden" name="redirectTo" value={rutaActual} />
        <span className="text-h3 text-text-secondary">Etiquetas</span>
        <div className="flex gap-2">
          <input
            type="text"
            name="etiquetas"
            defaultValue={idea.etiquetas ?? ""}
            placeholder="separadas por comas"
            className="flex-1 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm border border-border px-3 py-2 text-small text-text-primary active:bg-bg-secondary"
          >
            Guardar
          </button>
        </div>
      </form>

      <SerieSection
        piezaId={idea.id}
        plataforma={plataforma}
        serie={idea.serie}
        serieParte={idea.serie_parte}
        rutaActual={rutaActual}
      />

      {idea.estado === "idea" && (
        <div className="flex items-center gap-4">
          <Link
            href={`/contenido/${plataforma}/ideas/${idea.id}/convertir`}
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Convertir en guion
          </Link>

          <form action={descartarIdea}>
            <input type="hidden" name="id" value={idea.id} />
            <input type="hidden" name="redirectTo" value={rutaActual} />
            <ConfirmButton message="¿Descartar esta idea?" className="text-small text-accent">
              Descartar idea
            </ConfirmButton>
          </form>
        </div>
      )}
    </div>
  );
}
