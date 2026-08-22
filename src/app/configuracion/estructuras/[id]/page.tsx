import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { TIPOS_ESCENA, TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  agregarEscenaEstructura,
  eliminarEscenaEstructura,
  eliminarEstructura,
  moverEscenaEstructura,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EstructuraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: estructura } = await supabase
    .from("estructuras_guion")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!estructura) notFound();

  const { data: escenas } = await supabase
    .from("estructura_escenas")
    .select("*")
    .eq("estructura_id", id)
    .order("orden");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1">{estructura.nombre}</h1>
        <p className="text-small text-text-secondary">
          {PLATAFORMA_LABEL[estructura.plataforma as Plataforma]} · {estructura.duracion_segundos}
          s
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Escenas</h2>

        {escenas && escenas.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {escenas.map((escena, index) => (
              <li
                key={escena.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <div className="flex flex-col gap-1">
                  <form action={moverEscenaEstructura}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="estructura_id" value={id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Mover escena arriba"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowUp size={16} strokeWidth={1.5} />
                    </button>
                  </form>
                  <form action={moverEscenaEstructura}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="estructura_id" value={id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={index === escenas.length - 1}
                      aria-label="Mover escena abajo"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowDown size={16} strokeWidth={1.5} />
                    </button>
                  </form>
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-h3">
                    {TIPO_ESCENA_LABEL[escena.tipo_escena as TipoEscena]} ·{" "}
                    {escena.duracion_segundos}s
                  </span>
                  {escena.nota && (
                    <span className="text-small text-text-secondary">{escena.nota}</span>
                  )}
                </div>

                <form action={eliminarEscenaEstructura}>
                  <input type="hidden" name="id" value={escena.id} />
                  <input type="hidden" name="estructura_id" value={id} />
                  <ConfirmButton message="¿Eliminar esta escena?" className="p-2 -m-2 text-small text-accent">
                    Eliminar
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-text-disabled">Todavía no hay escenas.</p>
        )}

        <form
          action={agregarEscenaEstructura}
          className="flex flex-col gap-3 rounded-md border border-border p-3"
        >
          <input type="hidden" name="estructura_id" value={id} />

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Tipo<span className="text-accent"> *</span>
            </span>
            <select
              name="tipo_escena"
              required
              defaultValue=""
              className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            >
              <option value="" disabled>
                Selecciona un tipo
              </option>
              {TIPOS_ESCENA.map((t) => (
                <option key={t} value={t}>
                  {TIPO_ESCENA_LABEL[t]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Duración (segundos)<span className="text-accent"> *</span>
            </span>
            <input
              type="number"
              name="duracion_segundos"
              required
              min={1}
              defaultValue={5}
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Nota (opcional)</span>
            <input
              type="text"
              name="nota"
              placeholder="Ej. Presenta el problema en una frase"
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            + Añadir escena
          </button>
        </form>
      </section>

      <form action={eliminarEstructura}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton
          message="¿Eliminar esta estructura? Se borrarán también sus escenas."
          className="text-small text-danger"
        >
          Eliminar estructura
        </ConfirmButton>
      </form>
    </div>
  );
}
