"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** Item de acordeón del FAQ de la landing — alto animado (truco de grid
 *  `0fr`/`1fr`, mismo patrón que `CapturaIdeaInline`/`FilaPapelera`) en vez
 *  del `<details>` nativo, que no deja animar el colapso de forma fiable
 *  entre navegadores. */
export function FaqItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="rounded-md bg-bg-primary p-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 text-left text-h3"
      >
        {pregunta}
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 text-text-secondary transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-2 text-small text-text-secondary">{respuesta}</p>
        </div>
      </div>
    </div>
  );
}
