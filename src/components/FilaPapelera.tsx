"use client";

import { useRef, useState, type FormEvent } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";

/** Fila de `/configuracion/papelera` — al restaurar/eliminar, colapsa la
 *  fila (alto a 0 + fade) antes de que la mutación real llegue al servidor,
 *  en vez de que desaparezca de golpe en cuanto `revalidatePath` refresca
 *  la lista. Intercepta el primer `submit` (previniéndolo mientras anima) y
 *  deja pasar el segundo, disparado a mano tras la animación — el mismo
 *  patrón que ya usa `ConfirmButton` para reenviar el formulario. */
export function FilaPapelera({
  id,
  tipoBadge,
  texto,
  contexto,
  deletedAt,
  primera,
  restaurar,
  eliminar,
}: {
  id: string;
  tipoBadge: "Escena" | "Hook" | "CTA";
  texto: string;
  contexto: string;
  deletedAt: string;
  primera: boolean;
  restaurar: (formData: FormData) => Promise<void>;
  eliminar: (formData: FormData) => Promise<void>;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const bypass = useRef(false);

  function interceptar(e: FormEvent<HTMLFormElement>) {
    if (bypass.current) {
      bypass.current = false;
      return;
    }
    e.preventDefault();
    setSaliendo(true);
    const form = e.currentTarget;
    setTimeout(() => {
      bypass.current = true;
      form.requestSubmit();
    }, 200);
  }

  return (
    <li
      className={`grid transition-[grid-template-rows] duration-200 ease-out ${
        primera ? "" : "border-t border-border"
      }`}
      style={{ gridTemplateRows: saliendo ? "0fr" : "1fr" }}
    >
      <div
        className={`flex flex-col gap-2 overflow-hidden transition-opacity duration-150 ${
          saliendo ? "opacity-0" : "py-3.5 opacity-100"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-neutral-bg px-2.5 py-1 text-caption text-text-secondary">
            {tipoBadge}
          </span>
          <span className="text-caption text-text-disabled">
            Eliminado el {new Date(deletedAt).toLocaleDateString("es-ES")}
          </span>
        </div>

        <p className="text-body line-clamp-2">{texto}</p>
        <p className="text-small text-text-secondary">{contexto}</p>

        <div className="flex items-center gap-3">
          <form action={restaurar} onSubmit={interceptar}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="p-2 -m-2 text-small text-accent">
              Restaurar
            </button>
          </form>
          <form action={eliminar} onSubmit={interceptar}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton
              message="Esto borra el elemento para siempre — no se puede deshacer. ¿Seguro?"
              pendingLabel="Eliminando…"
              className="p-2 -m-2 text-small text-danger"
            >
              Eliminar definitivamente
            </ConfirmButton>
          </form>
        </div>
      </div>
    </li>
  );
}
