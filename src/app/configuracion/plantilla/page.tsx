import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_ICON, DIA_SEMANA_LABEL, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarPlantilla } from "./actions";

export const dynamic = "force-dynamic";

const DIA_ABREV = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export default async function PlantillaPage() {
  const supabase = await createClient();

  const { data: plantilla } = await supabase
    .from("plantilla_semanal")
    .select("*")
    .order("dia_semana");

  const porDia = new Map<number, typeof plantilla>();
  for (const p of plantilla ?? []) {
    porDia.set(p.dia_semana, [...(porDia.get(p.dia_semana) ?? []), p]);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-h1">Plantilla semanal</h1>
          <Link
            href="/configuracion/plantilla/nueva"
            className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover lg:px-4 lg:py-2 lg:text-body"
          >
            + Añadir
          </Link>
        </div>
        <p className="text-caption text-text-disabled">
          Solo como referencia manual — no genera recordatorios ni aparece en el dashboard.
        </p>

        <div className="flex flex-col">
          {DIA_SEMANA_LABEL.map((label, index) => {
            const dia = index + 1;
            const entradas = porDia.get(dia) ?? [];
            const esUltimo = index === DIA_SEMANA_LABEL.length - 1;

            return (
              <div key={dia} className="flex gap-3.5">
                <div className="flex w-11 shrink-0 flex-col items-center">
                  <span className="text-caption text-text-secondary">{DIA_ABREV[index]}</span>
                  <span
                    className={`mt-1.5 flex h-2.5 w-2.5 rounded-full ${
                      entradas.length > 0 ? "bg-accent" : "bg-border"
                    }`}
                  />
                  {!esUltimo && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  {entradas.length > 0 ? (
                    <div className="flex flex-col">
                      {entradas.map((entrada, entradaIndex) => {
                        const plataforma = entrada.plataforma as Plataforma | null;
                        const Icon = plataforma ? PLATAFORMA_ICON[plataforma] : FileText;
                        const tono = plataforma ? PLATAFORMA_TONO[plataforma] : "var(--neutral)";

                        return (
                          <div
                            key={entrada.id}
                            className={`flex items-center gap-3 py-2 ${
                              entradaIndex > 0 ? "border-t border-border" : ""
                            }`}
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm lg:h-8 lg:w-8"
                              style={{ backgroundColor: tono }}
                            >
                              <Icon size={14} strokeWidth={1.5} className="text-white lg:h-4 lg:w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-small font-medium text-text-primary lg:text-body">
                                {entrada.nota}
                              </p>
                              {plataforma && (
                                <p className="text-caption text-text-secondary">
                                  {PLATAFORMA_LABEL[plataforma]}
                                </p>
                              )}
                            </div>
                            <form action={eliminarPlantilla}>
                              <input type="hidden" name="id" value={entrada.id} />
                              <ConfirmButton
                                message="¿Eliminar esta entrada de la plantilla?"
                                className="p-2 -m-2 text-small text-accent"
                              >
                                Eliminar
                              </ConfirmButton>
                            </form>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-11 items-center">
                      <span className="text-small text-text-disabled">Sin nota</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
