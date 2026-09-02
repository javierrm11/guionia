import { PLATAFORMAS, PLATAFORMA_LABEL } from "@/lib/plataformas";
import { crearFrase } from "../../_shared/frasesActions";

export default function NuevoCtaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:p-8">
      <form action={crearFrase} className="flex flex-col gap-4">
        <input type="hidden" name="tipo_escena" value="cta" />
        <input type="hidden" name="redirectTo" value="/configuracion/ctas" />

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Plataforma<span className="text-accent"> *</span>
          </span>
          <select
            name="plataforma"
            required
            defaultValue=""
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-4 lg:py-2.5"
          >
            <option value="" disabled>
              Selecciona una plataforma
            </option>
            {PLATAFORMAS.map((p) => (
              <option key={p} value={p}>
                {PLATAFORMA_LABEL[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Texto del CTA<span className="text-accent"> *</span>
          </span>
          <textarea
            name="texto"
            required
            rows={3}
            autoFocus
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-4 lg:py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Nota (opcional)</span>
          <input
            type="text"
            name="nota"
            placeholder="Ej. Funciona bien para vender directo"
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-4 lg:py-2.5"
          />
        </label>

        <button
          type="submit"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover lg:px-5 lg:py-2.5"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
