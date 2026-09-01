"use client";

import { useEffect, useState } from "react";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

/** Cuenta de 0 al valor real al montar (usado en `StatMes`), en vez de que
 *  el número aparezca ya resuelto. Respeta prefers-reduced-motion mostrando
 *  el valor final directamente, sin animar. */
export function NumeroAnimado({ valor, sufijo = "" }: { valor: number; sufijo?: string }) {
  const [mostrado, setMostrado] = useState(0);

  useEffect(() => {
    const reducida = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duracion = reducida ? 0 : 600;
    const inicio = performance.now();
    let frame: number;

    function tick(ahora: number) {
      const progreso = duracion === 0 ? 1 : Math.min(1, (ahora - inicio) / duracion);
      const eased = 1 - Math.pow(1 - progreso, 3);
      setMostrado(Math.round(valor * eased));
      if (progreso < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valor]);

  return (
    <>
      {formatoNumero(mostrado)}
      {sufijo}
    </>
  );
}
