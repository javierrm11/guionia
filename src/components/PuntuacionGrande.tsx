"use client";

import { tonoPuntuacion } from "@/components/Puntuacion";
import type { ResultadoPuntuacion } from "@/lib/puntuacion";

export function PuntuacionGrande({ resultado }: { resultado: ResultadoPuntuacion }) {
  const tono = tonoPuntuacion(resultado.puntuacion);

  return (
    <div className="flex shrink-0 flex-col items-end text-right">
      <span className={`text-[32px] leading-none font-semibold tabular-nums ${tono.texto}`}>
        {resultado.puntuacion}
      </span>
      <span className="text-caption text-text-secondary">/100 · puntuación general</span>
    </div>
  );
}
