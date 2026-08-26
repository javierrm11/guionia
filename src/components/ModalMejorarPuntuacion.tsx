"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import type { ResultadoPuntuacion } from "@/lib/puntuacion";

export function ModalMejorarPuntuacion({
  resultado,
  etiqueta,
  onCerrar,
}: {
  resultado: ResultadoPuntuacion;
  etiqueta: string;
  onCerrar: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center lg:p-4"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[80vh] w-full flex-col gap-4 overflow-y-auto rounded-t-md bg-bg-secondary p-5 lg:max-w-md lg:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-h2">Cómo mejorarla</span>
            <span className="text-small text-text-secondary">{etiqueta}</span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="p-2 -m-2 text-text-secondary"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="flex flex-col gap-3">
          {resultado.factores.map((f) => (
            <li key={f.id} className="flex items-start gap-2">
              {f.puntos >= f.maximo ? (
                <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
              ) : (
                <X size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
              )}
              <span className="text-body text-text-secondary">
                <span className="text-text-primary">{f.etiqueta}</span>
                {f.consejo && <> — {f.consejo}</>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
