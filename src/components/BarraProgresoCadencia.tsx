"use client";

import { useEffect, useState } from "react";

/** Barra de progreso de cadencia semanal (`/contenido/plataformas`) — arranca
 *  en 0 y anima el relleno hasta el % real justo tras montar, en vez de
 *  aparecer ya con el ancho final (que en SSR no deja nada que transicionar). */
export function BarraProgresoCadencia({
  porcentaje,
  completa,
}: {
  porcentaje: number;
  completa: boolean;
}) {
  const [ancho, setAncho] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAncho(porcentaje));
    return () => cancelAnimationFrame(frame);
  }, [porcentaje]);

  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-bg">
      <div
        className={`h-1.5 rounded-full transition-[width] duration-700 ease-out ${
          completa ? "bg-success" : "bg-accent"
        }`}
        style={{ width: `${ancho}%` }}
      />
    </div>
  );
}
