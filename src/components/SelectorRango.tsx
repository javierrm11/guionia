"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RANGOS_ESTADISTICAS, RANGO_ESTADISTICAS_LABEL, type RangoEstadisticas } from "@/lib/contenido";

export function SelectorRango({ rango }: { rango: RangoEstadisticas }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={rango}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams);
        params.set("rango", e.target.value);
        router.push(`/contenido/cuenta?${params.toString()}`);
      }}
      className="self-start rounded-full bg-bg-primary px-4 py-2 text-small focus:ring-2 focus:ring-accent-bg focus:outline-none lg:px-5 lg:py-2.5 lg:text-body"
    >
      {RANGOS_ESTADISTICAS.map((r) => (
        <option key={r} value={r}>
          {RANGO_ESTADISTICAS_LABEL[r]}
        </option>
      ))}
    </select>
  );
}
