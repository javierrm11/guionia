"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Plus } from "lucide-react";
import { PLATAFORMA_ICON } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import type { TareaHoy } from "@/lib/contenido";
import { esRutaSinChrome } from "@/lib/navegacion";
import { obtenerTareasHoy } from "@/app/contenido/_shared/tareasHoyActions";

/** Panel "Hoy" fijo en escritorio (`lg:` en adelante) — mismas tareas
 *  pendientes que la tarjeta "hero" de Control, pero visible en cualquier
 *  pantalla de la app, para no tener que volver a Control a comprobar qué
 *  queda por hacer. Oculto en Control mismo (ya lo muestra ahí, a tamaño
 *  completo) y en las rutas sin chrome (auth, landing). Se recarga en cada
 *  cambio de ruta — al ser un componente cliente dentro del layout raíz, que
 *  no vuelve a ejecutarse en cada navegación, no hay otra forma de reflejar
 *  cambios hechos en otra pantalla (p. ej. escribir un guion nuevo) sin este
 *  refetch. */
export function PanelHoy() {
  const pathname = usePathname();
  const oculto = esRutaSinChrome(pathname) || pathname === "/contenido";
  const [tareas, setTareas] = useState<TareaHoy[] | null>(null);

  useEffect(() => {
    if (oculto) return;
    let cancelado = false;
    obtenerTareasHoy().then((datos) => {
      if (!cancelado) setTareas(datos);
    });
    return () => {
      cancelado = true;
    };
  }, [pathname, oculto]);

  if (oculto) return null;

  return (
    <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:p-4">
      <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-md bg-bg-secondary p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-h3">
            <CalendarCheck
              size={16}
              strokeWidth={1.5}
              className="text-accent"
            />
            Hoy
          </span>
          <Link href="/contenido" className="text-caption text-text-secondary">
            Ver todo
          </Link>
        </div>

        {tareas === null ? (
          <p className="text-caption text-text-disabled">Cargando…</p>
        ) : tareas.length === 0 ? (
          <p className="text-caption text-text-disabled">
            Nada pendiente para hoy.
          </p>
        ) : (
          <div className="flex flex-col">
            {tareas.map((t, index) => {
              const Icon = t.plataforma ? PLATAFORMA_ICON[t.plataforma] : Plus;
              const tono = t.plataforma
                ? PLATAFORMA_TONO[t.plataforma]
                : "var(--neutral)";

              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className={`flex items-center gap-2.5 py-2.5 hover:opacity-70 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-white" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-small text-text-primary">
                      {t.titulo}
                    </p>
                    <span className="text-caption text-text-secondary">
                      Falta el guion
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
