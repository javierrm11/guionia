import Link from "next/link";
import { Badge } from "@/components/Badge";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import {
  ESTADOS_IDEA,
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  getEtiquetasPopulares,
  pad2,
} from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const consulta = (q ?? "").trim();

  const supabase = await createClient();

  const etiquetasPopulares = await getEtiquetasPopulares(supabase);

  const { data: resultados } =
    consulta.length > 0
      ? await supabase
          .from("piezas_contenido")
          .select("*")
          .neq("estado", "descartada")
          .or(`titulo.ilike.%${consulta}%,etiquetas.ilike.%${consulta}%`)
          .order("created_at", { ascending: false })
          .limit(50)
      : { data: [] };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {etiquetasPopulares.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {etiquetasPopulares.map((etiqueta) => (
            <Link
              key={etiqueta}
              href={`/contenido/buscar?q=${encodeURIComponent(etiqueta)}`}
              className={`rounded-full px-3 py-1 text-caption ${
                consulta.toLowerCase() === etiqueta.toLowerCase()
                  ? "bg-accent text-white"
                  : "bg-neutral-bg text-text-secondary"
              }`}
            >
              {etiqueta}
            </Link>
          ))}
        </div>
      )}

      {consulta.length === 0 ? (
        <p className="text-small text-text-disabled">Escribe algo para buscar.</p>
      ) : resultados && resultados.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {resultados.map((r) => {
            const esIdea = (ESTADOS_IDEA as readonly string[]).includes(r.estado);
            const href = esIdea
              ? `/contenido/${r.plataforma}/ideas/${r.id}`
              : r.fecha_publicacion
                ? `/contenido/${r.plataforma}/videos/${r.fecha_publicacion.slice(0, 4)}/${pad2(Number(r.fecha_publicacion.slice(5, 7)))}/${pad2(Number(r.fecha_publicacion.slice(8, 10)))}/${r.id}`
                : `/contenido/${r.plataforma}/ideas/${r.id}`;

            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-3"
              >
                <Link href={href} className="truncate text-accent hover:underline">
                  {r.titulo}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-caption text-text-secondary">
                    {PLATAFORMA_LABEL[r.plataforma as Plataforma]}
                  </span>
                  <Badge tone={ESTADO_PIEZA_TONE[r.estado]}>{ESTADO_PIEZA_LABEL[r.estado]}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">Sin resultados para &quot;{consulta}&quot;.</p>
      )}
    </div>
  );
}
