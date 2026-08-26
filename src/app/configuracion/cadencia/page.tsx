import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarCadencia } from "./actions";

export const dynamic = "force-dynamic";

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
            className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
          >
            + Añadir
          </Link>
        </div>

        {cadencia && cadencia.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="bg-bg-secondary">
                  <th className="text-h3 px-3 py-2 text-left">Plataforma</th>
                  <th className="text-h3 px-3 py-2 text-left">Cantidad</th>
                  <th className="text-h3 px-3 py-2 text-left">Periodo</th>
                  <th className="text-h3 px-3 py-2 text-left">Nota</th>
                  <th className="text-h3 px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {cadencia.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-bg-secondary">
                    <td className="px-3 py-2">{PLATAFORMA_LABEL[c.plataforma as Plataforma]}</td>
                    <td className="px-3 py-2">{c.cantidad}</td>
                    <td className="px-3 py-2 text-text-secondary">{c.periodo}</td>
                    <td className="px-3 py-2 text-text-secondary">{c.nota ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={eliminarCadencia}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton
                          message="¿Eliminar esta cadencia?"
                          className="p-2 -m-2 text-small text-accent"
                        >
                          Eliminar
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-small text-text-disabled">Todavía no hay cadencia definida.</p>
        )}
      </section>
    </div>
  );
}
