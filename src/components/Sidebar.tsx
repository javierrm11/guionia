"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { ITEMS_NAV, esRutaActiva, esRutaSinChrome } from "@/lib/navegacion";
import { NuevoGuionFab } from "@/components/NuevoGuionFab";

/** Navegación principal en tablet y escritorio (`md:` en adelante) —
 *  sustituye a `BottomNav` a partir de ese ancho. En tablet (`md:` hasta
 *  antes de `lg:`) es un riel angosto de solo iconos (`md:w-20`); a partir
 *  de `lg:` se expande a un panel completo con etiquetas (`lg:w-60`) —
 *  todas las etiquetas de texto llevan `hidden lg:inline` para que solo el
 *  ancho del `<aside>` cambie entre un modo y otro, sin duplicar marcado.
 *  Panel fijo a la izquierda, pegado arriba mientras se hace scroll del
 *  contenido. */
export function Sidebar() {
  const pathname = usePathname();
  if (esRutaSinChrome(pathname)) return null;

  const enAjustes = esRutaActiva(pathname, "/configuracion");

  return (
    <aside className="hidden shrink-0 md:sticky md:top-0 md:flex md:h-screen md:w-20 md:flex-col md:p-3 lg:w-60 lg:p-4">
      <div className="flex h-full flex-col gap-1 rounded-md bg-bg-secondary p-2 lg:p-3">
        <div className="flex items-center justify-center px-1 py-3 lg:justify-start lg:px-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent font-display text-body font-semibold text-white lg:hidden">
            G
          </span>
          <span className="hidden text-h2 lg:inline">Guionia</span>
        </div>

        <div className="mb-2">
          <NuevoGuionFab variant="sidebar" />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {ITEMS_NAV.map(({ href, label, icon: Icon, prefijo }) => {
            const esActivo = esRutaActiva(pathname, prefijo);
            return (
              <Link
                key={href}
                href={href}
                aria-current={esActivo ? "page" : undefined}
                aria-label={label}
                data-tour={
                  href === "/contenido/ideas" ? "nav-ideas" : undefined
                }
                className={`flex min-h-11 items-center justify-center gap-3 rounded-sm px-3 lg:justify-start ${
                  esActivo ? "bg-accent-bg" : "hover:bg-neutral-bg"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={`shrink-0 ${esActivo ? "text-accent" : "text-text-secondary"}`}
                />
                <span
                  className={`hidden text-body lg:inline ${
                    esActivo ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-1 border-t border-border pt-1">
          <Link
            href="/configuracion"
            aria-current={enAjustes ? "page" : undefined}
            aria-label="Ajustes"
            className={`flex min-h-11 items-center justify-center gap-3 rounded-sm px-3 lg:justify-start ${
              enAjustes ? "bg-accent-bg" : "hover:bg-neutral-bg"
            }`}
          >
            <Settings
              size={20}
              strokeWidth={1.5}
              className={`shrink-0 ${enAjustes ? "text-accent" : "text-text-secondary"}`}
            />
            <span
              className={`hidden text-body lg:inline ${
                enAjustes ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              Ajustes
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
