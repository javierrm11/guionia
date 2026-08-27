import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, PILAR_LABEL } from "@/lib/contenido";
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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-8">
      <p className="text-h2">{idea.titulo}</p>

      <div className="flex items-center gap-2">
        <Badge tone={ESTADO_PIEZA_TONE[idea.estado]}>{ESTADO_PIEZA_LABEL[idea.estado]}</Badge>
        {idea.pilar && (
          <span className="text-small text-text-secondary">{PILAR_LABEL[idea.pilar]}</span>
        )}
      </div>

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
