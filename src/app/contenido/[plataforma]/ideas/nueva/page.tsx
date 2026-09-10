import { notFound } from "next/navigation";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  isPlataforma,
} from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PILAR_LABEL } from "@/lib/contenido";
import { crearIdea } from "./actions";

export default async function NuevaIdeaPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:p-8">
        <div className="flex items-center gap-3 rounded-md bg-accent-bg p-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
            style={{ backgroundColor: tono }}
          >
            <Icon size={20} strokeWidth={1.5} className="text-white" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-h1">Nueva idea</h1>
            <span className="text-caption text-text-secondary">
              {PLATAFORMA_LABEL[plataforma]}
            </span>
          </div>
        </div>

        <form
          action={crearIdea}
          className="flex flex-col gap-4 rounded-md bg-bg-primary p-4 shadow-sm lg:p-5"
        >
          <input type="hidden" name="plataforma" value={plataforma} />

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Título<span className="text-accent"> *</span>
            </span>
            <input
              type="text"
              name="titulo"
              required
              autoFocus
              placeholder="¿Qué idea se te acaba de ocurrir?"
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-4 lg:py-2.5"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Pilar</span>
            <select
              name="pilar"
              defaultValue=""
              className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-4 lg:py-2.5"
            >
              <option value="">Sin definir</option>
              {Object.entries(PILAR_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover lg:px-5 lg:py-2.5"
          >
            Guardar idea
          </button>
        </form>
      </div>
    </div>
  );
}
