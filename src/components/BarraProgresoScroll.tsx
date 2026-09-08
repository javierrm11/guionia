"use client";

import { useEffect, useState } from "react";

/** Barra fina fija arriba de la landing, indicando cuánto queda de scroll —
 *  con tantas secciones nuevas ayuda a que el visitante sienta que avanza,
 *  no que la página no se acaba nunca. */
export function BarraProgresoScroll() {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    function actualizar() {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      setProgreso(alto > 0 ? (window.scrollY / alto) * 100 : 0);
    }
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
}
