import { PLATAFORMAS, PLATAFORMA_LABEL } from "@/lib/plataformas";
import { crearEstructura } from "../actions";

export default function NuevaEstructuraPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <form action={crearEstructura} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Nombre</span>
          <input
            type="text"
            name="nombre"
            required
            autoFocus
            placeholder="Ej. Tutorial 60s"
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Plataforma</span>
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
          <span className="text-h3 text-text-secondary">Duración total (segundos)</span>
          <input
            type="number"
            name="duracion_segundos"
            required
            min={1}
            defaultValue={60}
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Crear y añadir escenas
        </button>
      </form>
    </div>
  );
}
