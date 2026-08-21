import { Check } from "lucide-react";
import { PLATAFORMAS, PLATAFORMA_ICON, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";

export function PlataformasActivasForm({
  activas,
  action,
  submitLabel = "Guardar",
}: {
  activas: Plataforma[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {PLATAFORMAS.map((p) => {
          const Icon = PLATAFORMA_ICON[p];
          return (
            <label
              key={p}
              className="relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-bg-primary p-4"
            >
              <input
                type="checkbox"
                name="plataforma"
                value={p}
                defaultChecked={activas.includes(p)}
                className="peer sr-only"
              />
              <span className="pointer-events-none absolute top-2 right-2 hidden h-5 w-5 items-center justify-center rounded-full bg-accent text-white peer-checked:flex">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary peer-checked:bg-accent-bg">
                <Icon size={20} strokeWidth={1.5} className="text-accent" />
              </span>
              <span className="text-h3 text-center text-text-primary">{PLATAFORMA_LABEL[p]}</span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        {submitLabel}
      </button>
    </form>
  );
}
