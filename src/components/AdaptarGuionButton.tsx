"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, X } from "lucide-react";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";

/** Clona el guion (título, pilar y escenas/texto) en otra plataforma activa
 *  — punto de partida para adaptar un guion ya escrito en vez de partir de
 *  cero. No se muestra si no hay ninguna otra plataforma activa a la que
 *  adaptar. */
export function AdaptarGuionButton({
  piezaId,
  plataformasDisponibles,
  adaptarAOtraPlataforma,
}: {
  piezaId: string;
  plataformasDisponibles: Plataforma[];
  adaptarAOtraPlataforma: (formData: FormData) => void | Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const destinoInputRef = useRef<HTMLInputElement>(null);

  if (plataformasDisponibles.length === 0) return null;

  function elegir(plataforma: Plataforma) {
    if (destinoInputRef.current) destinoInputRef.current.value = plataforma;
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={adaptarAOtraPlataforma}>
        <input type="hidden" name="id" value={piezaId} />
        <input ref={destinoInputRef} type="hidden" name="plataforma_destino" />
      </form>

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 rounded-sm px-4 py-2 text-body text-text-primary active:opacity-70"
      >
        <Copy size={14} strokeWidth={1.5} />
        Adaptar a otra plataforma
      </button>

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-bg-primary p-5">
              <div className="flex items-center justify-between">
                <span className="text-h2">Adaptar a otra plataforma</span>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="p-1 text-text-disabled"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-small text-text-secondary">
                Se crea un guion nuevo con el mismo título y las mismas escenas, listo para ajustar.
              </p>
              <div className="flex flex-col gap-2">
                {plataformasDisponibles.map((p) => {
                  const Icon = PLATAFORMA_ICON[p];
                  const tono = PLATAFORMA_TONO[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => elegir(p)}
                      className="flex items-center gap-3 rounded-md bg-bg-secondary p-3 text-left active:bg-accent-bg"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                        style={{ backgroundColor: tono }}
                      >
                        <Icon size={18} strokeWidth={1.5} className="text-white" />
                      </span>
                      <span className="text-body">{PLATAFORMA_LABEL[p]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
