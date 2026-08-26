"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { ModalMejorarPuntuacion } from "@/components/ModalMejorarPuntuacion";
import type { ResultadoPuntuacion } from "@/lib/puntuacion";

export function tonoPuntuacion(puntuacion: number) {
  if (puntuacion >= 70) return { texto: "text-success", barra: "bg-success" };
  if (puntuacion >= 40) return { texto: "text-warning", barra: "bg-warning" };
  return { texto: "text-danger", barra: "bg-danger" };
}

export function Puntuacion({
  resultado,
  etiqueta,
  ocultarResumen = false,
  modal = false,
}: {
  resultado: ResultadoPuntuacion;
  etiqueta: string;
  ocultarResumen?: boolean;
  modal?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const tono = tonoPuntuacion(resultado.puntuacion);
  const pendientes = resultado.factores.filter((f) => f.puntos < f.maximo).length;

  return (
    <div className="flex flex-col gap-1.5">
      {!ocultarResumen && (
        <>
          <div className="flex items-center gap-2">
            <span className={`text-h3 ${tono.texto}`}>{resultado.puntuacion}</span>
            <span className="text-caption text-text-secondary">/100 · {etiqueta}</span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-neutral-bg">
            <div className={`h-1.5 rounded-full ${tono.barra}`} style={{ width: `${resultado.puntuacion}%` }} />
          </div>
        </>
      )}

      {pendientes > 0 &&
        (modal ? (
          <>
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="flex items-center justify-between gap-2 rounded-sm bg-bg-primary px-3 py-2 text-small text-text-primary active:bg-bg-secondary"
            >
              Cómo mejorarla ({pendientes})
              <ChevronRight size={16} strokeWidth={1.5} className="text-accent" />
            </button>

            {abierto && (
              <ModalMejorarPuntuacion
                resultado={resultado}
                etiqueta={etiqueta}
                onCerrar={() => setAbierto(false)}
              />
            )}
          </>
        ) : (
          <details className="text-small">
            <summary className="cursor-pointer text-text-secondary">Cómo mejorarla ({pendientes})</summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {resultado.factores.map((f) => (
                <li key={f.id} className="flex items-start gap-1.5">
                  {f.puntos >= f.maximo ? (
                    <Check size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <X size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
                  )}
                  <span className="text-text-secondary">
                    <span className="text-text-primary">{f.etiqueta}</span>
                    {f.consejo && <> — {f.consejo}</>}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ))}
    </div>
  );
}
