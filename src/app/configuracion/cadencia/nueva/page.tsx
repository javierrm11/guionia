import { PLATAFORMAS, PLATAFORMA_LABEL } from "@/lib/plataformas";
import { crearCadencia } from "../actions";

export default function NuevaCadenciaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:p-8">
      <form action={crearCadencia} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Plataforma<span className="text-accent"> *</span>
          </span>
          <select
            name="plataforma"
            required
            defaultValue=""
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
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
            Cantidad<span className="text-accent"> *</span>
          </span>
          <input
            type="number"
            name="cantidad"
            required
            min={1}
            defaultValue={1}
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Periodo<span className="text-accent"> *</span>
          </span>
          <select
            name="periodo"
            required
            defaultValue="semana"
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          >
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Nota (opcional)</span>
          <input
            type="text"
            name="nota"
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
