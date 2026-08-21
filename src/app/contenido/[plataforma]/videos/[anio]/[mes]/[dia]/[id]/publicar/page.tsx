import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import { publicarConMetadatos } from "../actions";

export const dynamic = "force-dynamic";

export default async function PublicarPage({
  params,
}: {
  params: Promise<{ plataforma: string; anio: string; mes: string; dia: string; id: string }>;
}) {
  const { plataforma, anio, mes, dia, id } = await params;
  if (!isPlataforma(plataforma)) notFound();
  if (plataforma === "linkedin") notFound();

  const supabase = await createClient();

  const { data: guion } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("id", id)
    .eq("plataforma", plataforma)
    .maybeSingle();

  if (!guion) notFound();

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("*")
    .eq("pieza_id", id)
    .order("orden");

  const rutaActual = `/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${guion.id}`;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <p className="text-h2">{guion.titulo}</p>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-bg-primary p-4">
        {escenas && escenas.length > 0 ? (
          escenas.map((escena) => (
            <div key={escena.id} className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">
                {TIPO_ESCENA_LABEL[escena.tipo_escena as TipoEscena]}:
              </span>
              <p className="text-body whitespace-pre-wrap">{escena.texto || "—"}</p>
            </div>
          ))
        ) : (
          <p className="text-body whitespace-pre-wrap">{guion.texto || "—"}</p>
        )}
      </div>

      <form
        action={publicarConMetadatos}
        className="flex flex-col gap-3 rounded-md border border-border p-3"
      >
        <input type="hidden" name="id" value={guion.id} />
        <input type="hidden" name="plataforma" value={plataforma} />
        <input type="hidden" name="redirectTo" value={rutaActual} />

        {plataforma === "youtube" && (
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Título para YouTube</span>
            <input
              type="text"
              name="titulo_publicacion"
              defaultValue={guion.titulo_publicacion ?? ""}
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            {plataforma === "youtube" ? "Descripción" : "Descripción (con hashtags)"}
          </span>
          <textarea
            name="descripcion_publicacion"
            rows={5}
            autoFocus
            defaultValue={guion.descripcion_publicacion ?? ""}
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        {plataforma === "youtube" && (
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Etiquetas</span>
            <input
              type="text"
              name="etiquetas_publicacion"
              placeholder="separadas por comas"
              defaultValue={guion.etiquetas_publicacion ?? ""}
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>
        )}

        <button
          type="submit"
          className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Marcar como publicado
        </button>
      </form>
    </div>
  );
}
