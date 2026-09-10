"use client";

import { useRouter } from "next/navigation";
import { MES_LABEL, pad2 } from "@/lib/contenido";

/** Título "Marzo 2026" del calendario mensual, convertido en dos `<select>`
 *  (mes y año) — saltar a un mes lejano ya no exige darle a la flecha una
 *  por una. */
export function SelectorMesCalendario({
  base,
  anio,
  mes,
}: {
  /** Ruta antes de `/{anio}/{mes}`, p. ej. `/contenido/youtube/videos`. */
  base: string;
  anio: number;
  mes: number;
}) {
  const router = useRouter();

  const anios = Array.from({ length: 7 }, (_, i) => anio - 3 + i);

  return (
    <div className="flex items-center gap-1">
      <select
        value={mes}
        onChange={(e) =>
          router.push(`${base}/${anio}/${pad2(Number(e.target.value))}`)
        }
        aria-label="Mes"
        style={{ "--input-bg": "transparent" } as React.CSSProperties}
        className="rounded-sm text-h1 font-medium"
      >
        {MES_LABEL.map((label, i) => (
          <option key={label} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={anio}
        onChange={(e) => router.push(`${base}/${e.target.value}/${pad2(mes)}`)}
        aria-label="Año"
        style={{ "--input-bg": "transparent" } as React.CSSProperties}
        className="rounded-sm text-h1 font-medium"
      >
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
