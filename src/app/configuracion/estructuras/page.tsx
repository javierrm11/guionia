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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex justify-end">
        <Link
          href="/configuracion/estructuras/nueva"
          className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover lg:px-4 lg:py-2 lg:text-body"
        >
          + Añadir
        </Link>
      </div>

      {estructuras && estructuras.length > 0 ? (
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
          {estructuras.map((e, index) => {
            const numEscenas = e.estructura_escenas?.[0]?.count ?? 0;
            return (
              <div
                key={e.id}
                className={`flex flex-col gap-2 py-3.5 lg:py-4 ${
                  index > 0 ? "border-t border-border lg:border-t-0" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/configuracion/estructuras/${e.id}`}
                    className="flex items-center gap-2 text-h3 text-text-primary hover:underline lg:text-h2"
                  >
                    {e.nombre}
                    {numEscenas === 0 && <Badge tone="warning">Incompleta</Badge>}
                  </Link>
                  <form action={duplicarEstructura}>
                    <input type="hidden" name="id" value={e.id} />
                    <SubmitButton pendingLabel="Duplicando…" className="p-2 -m-2 text-small text-accent">
                      Duplicar
                    </SubmitButton>
                  </form>
                </div>
                <p className="text-caption text-text-secondary lg:text-small">
                  {PLATAFORMA_LABEL[e.plataforma as Plataforma]} · {e.duracion_segundos}s · {numEscenas}{" "}
                  {numEscenas === 1 ? "escena" : "escenas"}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-small text-text-disabled">Todavía no hay estructuras guardadas.</p>
      )}
    </div>
  );
}
