"use client";

import { useRouter } from "next/navigation";
import { RANGOS_ESTADISTICAS, RANGO_ESTADISTICAS_LABEL, type RangoEstadisticas } from "@/lib/contenido";

export function SelectorRango({ rango }: { rango: RangoEstadisticas }) {
  const router = useRouter();

  return (
    <select
      value={rango}
      onChange={(e) => router.push(`/contenido/cuenta?rango=${e.target.value}`)}
      className="self-start rounded-sm border border-border bg-bg-primary px-3 py-2 text-small focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
    >
      {RANGOS_ESTADISTICAS.map((r) => (
        <option key={r} value={r}>
          {RANGO_ESTADISTICAS_LABEL[r]}
        </option>
      ))}
    </select>
  );
}
