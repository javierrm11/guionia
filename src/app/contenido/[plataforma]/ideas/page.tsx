import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { ESTADOS_IDEA, ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, PILAR_LABEL } from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function IdeasPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const supabase = await createClient();

  const { data: ideas } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("plataforma", plataforma)
    .in("estado", ESTADOS_IDEA)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <Link
        href={`/contenido/${plataforma}/ideas/nueva`}
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nueva idea
      </Link>

      {ideas && ideas.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="text-h3 px-3 py-2 text-left">Título</th>
                <th className="text-h3 px-3 py-2 text-left">Pilar</th>
                <th className="text-h3 px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.id} className="border-t border-border hover:bg-bg-secondary">
                  <td className="px-3 py-2">
                    <Link
                      href={`/contenido/${plataforma}/ideas/${idea.id}`}
                      className="text-accent hover:underline"
                    >
                      {idea.titulo}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {idea.pilar ? PILAR_LABEL[idea.pilar] : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={ESTADO_PIEZA_TONE[idea.estado]}>
                      {ESTADO_PIEZA_LABEL[idea.estado]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-small text-text-disabled">
          Todavía no hay ideas para esta plataforma.
        </p>
      )}
    </div>
  );
}
