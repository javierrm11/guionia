"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITEMS_NAV, RUTAS_AUTH, esRutaActiva } from "@/lib/navegacion";

/** Barra de navegación inferior — franja fija a todo el ancho, sin flotar ni
 *  sombra (solo borde superior), solo hasta tablet — en escritorio (`lg:`)
 *  la navegación vive en `Sidebar`. El ítem activo se distingue por color de
 *  icono/texto (--text-primary vs. --text-disabled), sin fondo. */
export function BottomNav() {
  const pathname = usePathname();
  if (RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta))) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center border-t border-border bg-bg-secondary px-2 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden"
      style={{ boxShadow: "none" }}
    >
      <div className="flex w-full max-w-[600px] items-center justify-around">
        {ITEMS_NAV.map(({ href, label, icon: Icon, prefijo }) => {
          const esActivo = esRutaActiva(pathname, prefijo);
          return (
            <Link
              key={href}
              href={href}
              aria-current={esActivo ? "page" : undefined}
              className="flex flex-col items-center gap-1 px-3.5 py-1.5"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={esActivo ? "text-text-primary" : "text-text-disabled"}
              />
              <span className={`text-caption ${esActivo ? "text-text-primary" : "text-text-disabled"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
