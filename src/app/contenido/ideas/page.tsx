import Link from "next/link";
import { Badge } from "@/components/Badge";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ESTADOS_IDEA, ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, PILAR_LABEL } from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function IdeasGlobalPage() {
  const supabase = await createClient();

  const { data: ideas } = await supabase
    .from("piezas_contenido")
    .select("*")
    .in("estado", ESTADOS_IDEA)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {ideas && ideas.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="text-h3 px-3 py-2 text-left">Título</th>
                <th className="text-h3 px-3 py-2 text-left">Plataforma</th>
                <th className="text-h3 px-3 py-2 text-left">Pilar</th>
                <th className="text-h3 px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.id} className="border-t border-border hover:bg-bg-secondary">
                  <td className="px-3 py-2">
                    <Link
                      href={`/contenido/${idea.plataforma}/ideas/${idea.id}`}
                      className="text-accent hover:underline"
                    >
                      {idea.titulo}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {PLATAFORMA_LABEL[idea.plataforma as Plataforma]}
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
        <p className="text-small text-text-disabled">Todavía no hay ideas guardadas.</p>
      )}
    </div>
  );
}
