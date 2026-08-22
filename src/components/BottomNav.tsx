"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITEMS_NAV, RUTAS_AUTH, esRutaActiva } from "@/lib/navegacion";

/** Barra de navegación inferior flotante (cristal), solo hasta tablet — en
 *  escritorio (`lg:`) la navegación vive en `Sidebar`. El ítem activo se
 *  marca con fondo --accent-bg; iconos a 20px, como indica CLAUDE.md. */
export function BottomNav() {
  const pathname = usePathname();
  if (RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta))) return null;

  return (
    <nav className="fixed inset-x-4 bottom-4 z-20 flex items-center gap-1 rounded-md bg-bg-secondary p-2 lg:hidden">
      {ITEMS_NAV.map(({ href, label, icon: Icon, prefijo }) => {
        const esActivo = esRutaActiva(pathname, prefijo);
        return (
          <Link
            key={href}
            href={href}
            aria-current={esActivo ? "page" : undefined}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-sm p-1 ${
              esActivo ? "bg-accent-bg" : "active:bg-accent-bg"
            }`}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className={esActivo ? "text-accent" : "text-text-secondary"}
            />
            <span
              className={`text-caption ${esActivo ? "text-text-primary" : "text-text-secondary"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
