import { redirect } from "next/navigation";
import { DIA_SEMANA_ABREV, PLATAFORMA_ICON, PLATAFORMA_LABEL, isPlataforma } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import { crearCadenciaInicial } from "./actions";

export const dynamic = "force-dynamic";

export default async function BienvenidaPage() {
  const supabase = await createClient();

  const { data } = await supabase.from("plataformas_activas").select("plataforma");
  const activas = (data ?? []).map((r) => r.plataforma).filter(isPlataforma);

  if (activas.length === 0) {
    redirect("/contenido/plataformas");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1">¿Qué días subes contenido?</h1>
        <p className="text-small text-text-secondary">
          Marca los días de cada plataforma — con eso creamos tu cadencia semanal y tu plantilla.
          Podrás ajustarlo después.
        </p>
      </div>

      <form action={crearCadenciaInicial} className="flex flex-col gap-6">
        <div className="flex flex-col">
          {activas.map((p, index) => {
            const Icon = PLATAFORMA_ICON[p];
            const tono = PLATAFORMA_TONO[p];

            return (
              <div
                key={p}
                className={`flex flex-col gap-3 py-4 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="flex-1 text-h3">{PLATAFORMA_LABEL[p]}</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {DIA_SEMANA_ABREV.map((abrev, index) => {
                    const dia = index + 1;
                    return (
                      <label key={dia} className="cursor-pointer">
                        <input
                          type="checkbox"
                          name={`dia_${p}_${dia}`}
                          className="peer sr-only"
                        />
                        <span className="flex h-9 items-center justify-center rounded-sm bg-bg-secondary text-caption font-medium text-text-secondary peer-checked:bg-accent peer-checked:text-white">
                          {abrev}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Crear cadencia y plantilla
          </button>
          <a href="/contenido" className="text-small text-text-secondary">
            Saltar por ahora
          </a>
        </div>
      </form>
    </div>
  );
}
