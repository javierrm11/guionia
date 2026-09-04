"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITEMS_NAV, esRutaActiva, esRutaSinChrome } from "@/lib/navegacion";
import { NuevoGuionFab } from "@/components/NuevoGuionFab";

/** Navegación principal en escritorio (`lg:` en adelante) — sustituye a
 *  `BottomNav` a partir de ese ancho. Panel de cristal fijo a la izquierda,
 *  pegado arriba mientras se hace scroll del contenido. */
export function Sidebar() {
  const pathname = usePathname();
  if (esRutaSinChrome(pathname)) return null;

  return (
    <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-col lg:p-4">
      <div className="flex h-full flex-col gap-1 rounded-md bg-bg-secondary p-3">
        <span className="px-3 py-3 text-h2">Guionia</span>

        <div className="mb-2">
          <NuevoGuionFab variant="sidebar" />
        </div>

        {ITEMS_NAV.map(({ href, label, icon: Icon, prefijo }) => {
          const esActivo = esRutaActiva(pathname, prefijo);
          return (
            <Link
              key={href}
              href={href}
              aria-current={esActivo ? "page" : undefined}
              data-tour={href === "/contenido/ideas" ? "nav-ideas" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-sm px-3 ${
                esActivo ? "bg-accent-bg" : "hover:bg-accent-bg"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={esActivo ? "text-accent" : "text-text-secondary"}
              />
              <span
                className={`text-body ${esActivo ? "text-text-primary" : "text-text-secondary"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
