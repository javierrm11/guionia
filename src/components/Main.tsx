"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { esRutaSinChrome } from "@/lib/navegacion";

/** `pb-28` deja hueco para la barra inferior flotante — solo hace falta
 *  fuera de las rutas sin chrome (auth y la landing) y por debajo de `md:`,
 *  donde `BottomNav` deja de renderizarse (la navegación pasa a vivir en
 *  `Sidebar`, ya sea como riel de iconos en tablet o completo en escritorio). */
export function Main({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sinChrome = esRutaSinChrome(pathname);

  return (
    <main
      className={`flex flex-1 flex-col ${sinChrome ? "" : "pb-28 md:pb-8"}`}
    >
      {children}
    </main>
  );
}
