"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { CapturaRapidaForm } from "@/components/CapturaRapidaForm";
import type { Plataforma } from "@/lib/plataformas";

/** Botón flotante de captura rápida: reemplaza el formulario siempre visible
 *  por un acceso rápido que abre el mismo `CapturaRapidaForm` en una hoja
 *  inferior, dejando la pantalla de Inicio despejada para la semana. */
export function CapturaFlotante({ plataformas }: { plataformas: Plataforma[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Capturar una idea"
        className="fixed right-6 bottom-24 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg active:bg-accent-hover"
      >
        <Lightbulb size={24} strokeWidth={1.5} />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50"
          onClick={() => setAbierto(false)}
        >
          <div
            className="flex flex-col gap-3 rounded-t-md bg-bg-secondary p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-h3 text-text-secondary">Nueva idea</span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="p-2 -m-2 text-text-secondary"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <CapturaRapidaForm plataformas={plataformas} onGuardado={() => setAbierto(false)} />
          </div>
        </div>
      )}
    </>
  );
}
