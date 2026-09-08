"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Botón flotante para volver arriba, solo visible tras pasar el hero
 *  (`min-h-screen`) — un poco más alto que la barra inferior de
 *  `CtaFlotanteLanding` (`bottom-24` vs `bottom-4`) para no solaparse con
 *  ella en móvil, donde esa barra ocupa casi todo el ancho. */
export function BotonVolverArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function actualizar() {
      setVisible(window.scrollY > window.innerHeight);
    }
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    return () => window.removeEventListener("scroll", actualizar);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className={`fixed right-4 bottom-24 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-bg-primary text-text-secondary shadow-lg transition-all hover:text-accent lg:right-8 lg:bottom-8 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp size={18} strokeWidth={1.5} />
    </button>
  );
}
