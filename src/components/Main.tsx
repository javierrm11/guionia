"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RUTAS_AUTH } from "@/lib/navegacion";

/** `pb-28` deja hueco para la barra inferior flotante — solo hace falta
 *  fuera de las rutas de auth, donde `BottomNav` no se renderiza. */
export function Main({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enAuth = RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta));

  return (
    <main className={`flex flex-1 flex-col ${enAuth ? "" : "pb-28 lg:pb-8"}`}>{children}</main>
  );
}
