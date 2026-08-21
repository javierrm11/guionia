import { notFound } from "next/navigation";
import { isPlataforma } from "@/lib/plataformas";
import { PILAR_LABEL } from "@/lib/contenido";
import { crearIdea } from "./actions";

export default async function NuevaIdeaPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <form action={crearIdea} className="flex flex-col gap-4">
        <input type="hidden" name="plataforma" value={plataforma} />

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Título</span>
          <input
            type="text"
            name="titulo"
            required
            autoFocus
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Pilar</span>
          <select
            name="pilar"
            defaultValue=""
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          >
            <option value="">Sin definir</option>
            {Object.entries(PILAR_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Etiquetas (opcional)</span>
          <input
            type="text"
            name="etiquetas"
            placeholder="separadas por comas, ej. whatsapp, ia"
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Guardar idea
        </button>
      </form>
    </div>
  );
}
