"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Envuelve `children` —ya renderizados por quien llama, nunca una función/
 * componente sin instanciar, eso no cruza la frontera servidor→cliente— y
 * les aplica el mismo fade+slide del hero (`animate-tarjeta-entrada`) en
 * cuanto entran en el viewport, una sola vez (`observer.disconnect()`), en
 * vez de estar visibles desde el primer pintado.
 */
export function RevelarAlScroll({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? "animate-tarjeta-entrada" : "opacity-0"}`}
      style={visible ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
