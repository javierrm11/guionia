import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import { SubmitButton } from "@/components/SubmitButton";
import { SubirVideoYoutube } from "@/components/SubirVideoYoutube";
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
    .is("deleted_at", null)
    .order("orden");

  const rutaActual = `/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${guion.id}`;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-8">
      <p className="text-h2">{guion.titulo}</p>

      <div className="flex flex-col gap-4 rounded-md bg-bg-primary p-4">
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

      {plataforma === "youtube" ? (
        <SubirVideoYoutube
          id={guion.id}
          redirectTo={rutaActual}
          tituloInicial={guion.titulo_publicacion ?? guion.titulo}
          descripcionInicial={guion.descripcion_publicacion ?? ""}
          etiquetasInicial={guion.etiquetas_publicacion ?? ""}
          botonManual={
            <form action={publicarConMetadatos}>
              <input type="hidden" name="id" value={guion.id} />
              <input type="hidden" name="plataforma" value={plataforma} />
              <input type="hidden" name="redirectTo" value={rutaActual} />
              <input
                type="hidden"
                name="titulo_publicacion"
                value={guion.titulo_publicacion ?? guion.titulo}
              />
              <input
                type="hidden"
                name="descripcion_publicacion"
                value={guion.descripcion_publicacion ?? ""}
              />
              <input
                type="hidden"
                name="etiquetas_publicacion"
                value={guion.etiquetas_publicacion ?? ""}
              />
              <SubmitButton
                pendingLabel="Marcando…"
                className="rounded-sm bg-neutral-bg px-4 py-2 text-body text-text-primary active:bg-border disabled:opacity-60"
              >
                Marcar como publicado
              </SubmitButton>
            </form>
          }
        />
      ) : (
        <form
          action={publicarConMetadatos}
          className="flex flex-col gap-3 rounded-md bg-bg-primary p-4"
        >
          <input type="hidden" name="id" value={guion.id} />
          <input type="hidden" name="plataforma" value={plataforma} />
          <input type="hidden" name="redirectTo" value={rutaActual} />

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Descripción (con hashtags)</span>
            <textarea
              name="descripcion_publicacion"
              rows={5}
              autoFocus
              defaultValue={guion.descripcion_publicacion ?? ""}
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          <SubmitButton
            pendingLabel="Publicando…"
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            Marcar como publicado
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
