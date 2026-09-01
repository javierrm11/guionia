"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { esRutaSinChrome } from "@/lib/navegacion";

/** `pb-28` deja hueco para la barra inferior flotante — solo hace falta
 *  fuera de las rutas sin chrome (auth y la landing), donde `BottomNav` no
 *  se renderiza. */
export function Main({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sinChrome = esRutaSinChrome(pathname);

  return (
    <main className={`flex flex-1 flex-col ${sinChrome ? "" : "pb-28 lg:pb-8"}`}>{children}</main>
  );
}
