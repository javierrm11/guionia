import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { duplicarEstructura } from "./actions";

export const dynamic = "force-dynamic";

export default async function EstructurasPage() {
  const supabase = await createClient();

  const { data: estructuras } = await supabase
    .from("estructuras_guion")
    .select("*, estructura_escenas(count)")
    .order("plataforma")
    .order("duracion_segundos");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link
        href="/configuracion/estructuras/nueva"
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nueva estructura
      </Link>

      {estructuras && estructuras.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="text-h3 px-3 py-2 text-left">Nombre</th>
                <th className="text-h3 px-3 py-2 text-left">Plataforma</th>
                <th className="text-h3 px-3 py-2 text-left">Duración</th>
                <th className="text-h3 px-3 py-2 text-left">Escenas</th>
                <th className="text-h3 px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {estructuras.map((e) => {
                const numEscenas = e.estructura_escenas?.[0]?.count ?? 0;
                return (
                <tr key={e.id} className="border-t border-border hover:bg-bg-secondary">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/configuracion/estructuras/${e.id}`}
                        className="text-accent hover:underline"
                      >
                        {e.nombre}
                      </Link>
                      {numEscenas === 0 && <Badge tone="warning">Incompleta</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {PLATAFORMA_LABEL[e.plataforma as Plataforma]}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{e.duracion_segundos}s</td>
                  <td className="px-3 py-2 text-text-secondary">{numEscenas}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={duplicarEstructura}>
                      <input type="hidden" name="id" value={e.id} />
                      <SubmitButton pendingLabel="Duplicando…" className="p-2 -m-2 text-small text-accent">
                        Duplicar
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-small text-text-disabled">Todavía no hay estructuras guardadas.</p>
      )}
    </div>
  );
}
