"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const PASO = 280;

/** Envuelve una tira horizontal (`overflow-x-auto`) con flechas prev/next
 *  estilo Instagram en vez de depender de la barra de scroll nativa (que
 *  `.scrollbar-none` oculta) — el swipe táctil en móvil sigue funcionando
 *  igual, las flechas son solo para ratón (`lg:`). */
export function CarruselFlechas({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  const actualizar = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPuedeIzq(el.scrollLeft > 4);
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    actualizar();
  }, []);

  const desplazar = (direccion: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direccion * PASO, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={actualizar}
        className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8"
      >
        {children}
      </div>

      {puedeIzq && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            desplazar(-1);
          }}
          aria-label="Anterior"
          className="absolute top-1/2 left-1 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg-primary text-text-primary shadow-md"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
      )}
      {puedeDer && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            desplazar(1);
          }}
          aria-label="Siguiente"
          className="absolute top-1/2 right-1 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg-primary text-text-primary shadow-md"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
