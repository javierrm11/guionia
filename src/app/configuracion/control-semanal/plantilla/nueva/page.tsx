import { DIA_SEMANA_LABEL, PLATAFORMAS, PLATAFORMA_LABEL } from "@/lib/plataformas";
import { crearPlantilla } from "../../actions";

export default function NuevaPlantillaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <form action={crearPlantilla} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Día de la semana<span className="text-accent"> *</span>
          </span>
          <select
            name="dia_semana"
            required
            defaultValue=""
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          >
            <option value="" disabled>
              Selecciona un día
            </option>
            {DIA_SEMANA_LABEL.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Plataforma (opcional)</span>
          <select
            name="plataforma"
            defaultValue=""
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          >
            <option value="">Sin definir</option>
            {PLATAFORMAS.map((p) => (
              <option key={p} value={p}>
                {PLATAFORMA_LABEL[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Nota<span className="text-accent"> *</span>
          </span>
          <input
            type="text"
            name="nota"
            required
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
