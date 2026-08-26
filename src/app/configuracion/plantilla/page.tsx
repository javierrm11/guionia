import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DIA_SEMANA_LABEL, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarPlantilla } from "./actions";

export const dynamic = "force-dynamic";

export default async function PlantillaPage() {
  const supabase = await createClient();

  const { data: plantilla } = await supabase
    .from("plantilla_semanal")
    .select("*")
    .order("dia_semana");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-h1">Plantilla semanal</h1>
          <Link
            href="/configuracion/plantilla/nueva"
            className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
          >
            + Añadir
          </Link>
        </div>
        <p className="text-caption text-text-disabled">
          Solo como referencia manual — no genera recordatorios ni aparece en el dashboard.
        </p>

        {plantilla && plantilla.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="bg-bg-secondary">
                  <th className="text-h3 px-3 py-2 text-left">Día</th>
                  <th className="text-h3 px-3 py-2 text-left">Plataforma</th>
                  <th className="text-h3 px-3 py-2 text-left">Nota</th>
                  <th className="text-h3 px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {plantilla.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-bg-secondary">
                    <td className="px-3 py-2">{DIA_SEMANA_LABEL[p.dia_semana - 1]}</td>
                    <td className="px-3 py-2 text-text-secondary">
                      {p.plataforma ? PLATAFORMA_LABEL[p.plataforma as Plataforma] : "—"}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">{p.nota}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={eliminarPlantilla}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton
                          message="¿Eliminar esta entrada de la plantilla?"
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
          <p className="text-small text-text-disabled">
            Todavía no hay plantilla semanal definida.
          </p>
        )}
      </section>
    </div>
  );
}
