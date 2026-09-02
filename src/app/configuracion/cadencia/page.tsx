import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarCadencia } from "./actions";

export const dynamic = "force-dynamic";

const PERIODO_LABEL: Record<string, string> = {
  semana: "por semana",
  mes: "por mes",
};

export default async function CadenciaPage() {
  const supabase = await createClient();

  const { data: cadencia } = await supabase
    .from("cadencia_contenido")
    .select("*")
    .order("plataforma");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-h1">Cadencia fija</h1>
          <Link
            href="/configuracion/cadencia/nueva"
            className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover lg:px-4 lg:py-2 lg:text-body"
          >
            + Añadir
          </Link>
        </div>

        {cadencia && cadencia.length > 0 ? (
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
            {cadencia.map((c, index) => {
              const plataforma = c.plataforma as Plataforma;
              const Icon = PLATAFORMA_ICON[plataforma];
              const tono = PLATAFORMA_TONO[plataforma];

              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3.5 py-3.5 lg:py-4 ${
                    index > 0 ? "border-t border-border lg:border-t-0" : ""
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm lg:h-12 lg:w-12"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-white lg:h-[22px] lg:w-[22px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-text-secondary">
                      {PLATAFORMA_LABEL[plataforma]}
                    </p>
                    <p className="text-h2 lg:text-h1">
                      {c.cantidad}{" "}
                      <span className="text-small font-normal text-text-secondary">
                        {PERIODO_LABEL[c.periodo] ?? c.periodo}
                      </span>
                    </p>
                    {c.nota && (
                      <p className="mt-0.5 truncate text-caption text-text-disabled">{c.nota}</p>
                    )}
                  </div>
                  <form action={eliminarCadencia}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton
                      message="¿Eliminar esta cadencia?"
                      className="p-2 -m-2 shrink-0 text-small text-accent"
                    >
                      Eliminar
                    </ConfirmButton>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-small text-text-disabled">Todavía no hay cadencia definida.</p>
        )}
      </section>
    </div>
  );
}
