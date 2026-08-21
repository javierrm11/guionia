import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_IDEA, pad2 } from "@/lib/contenido";
import { guardarSerie } from "@/app/contenido/_shared/serieActions";

export async function SerieSection({
  piezaId,
  plataforma,
  serie,
  serieParte,
  rutaActual,
}: {
  piezaId: string;
  plataforma: string;
  serie: string | null;
  serieParte: number | null;
  rutaActual: string;
}) {
  const supabase = await createClient();

  const { data: hermanas } = serie
    ? await supabase
        .from("piezas_contenido")
        .select("id, titulo, serie_parte, estado, fecha_publicacion")
        .eq("plataforma", plataforma)
        .eq("serie", serie)
        .neq("id", piezaId)
        .order("serie_parte", { ascending: true })
    : { data: [] };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <form action={guardarSerie} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={piezaId} />
        <input type="hidden" name="redirectTo" value={rutaActual} />
        <span className="text-h3 text-text-secondary">Serie</span>
        <div className="flex gap-2">
          <input
            type="text"
            name="serie"
            defaultValue={serie ?? ""}
            placeholder="ej. Cómo gané mi primer cliente"
            className="flex-1 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
          <input
            type="number"
            name="serie_parte"
            min={1}
            defaultValue={serieParte ?? ""}
            placeholder="parte"
            className="w-20 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm border border-border px-3 py-2 text-small text-text-primary active:bg-bg-secondary"
          >
            Guardar
          </button>
        </div>
      </form>

      {hermanas && hermanas.length > 0 && (
        <ul className="flex flex-col gap-1">
          {hermanas.map((h) => {
            const esIdea = (ESTADOS_IDEA as readonly string[]).includes(h.estado);
            const href = esIdea
              ? `/contenido/${plataforma}/ideas/${h.id}`
              : h.fecha_publicacion
                ? `/contenido/${plataforma}/videos/${h.fecha_publicacion.slice(0, 4)}/${pad2(Number(h.fecha_publicacion.slice(5, 7)))}/${pad2(Number(h.fecha_publicacion.slice(8, 10)))}/${h.id}`
                : `/contenido/${plataforma}/ideas/${h.id}`;

            return (
              <li key={h.id} className="text-small text-accent">
                <Link href={href} className="hover:underline">
                  {h.serie_parte ? `Parte ${h.serie_parte}: ` : ""}
                  {h.titulo}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
