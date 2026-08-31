"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Search, TrendingUp } from "lucide-react";

const RUTAS_AUTH = [
  "/login",
  "/registro",
  "/olvide-password",
  "/restablecer-password",
  "/auth",
  "/legal",
];

/** Rutas con flecha de volver que además llevan su título aquí mismo, junto
 *  a la flecha, en vez de repetirlo como `<h1>` dentro de la página. */
const TITULOS: Record<string, string> = {
  "/contenido/ideas": "Ideas",
  "/contenido/plataformas": "Plataformas",
  "/contenido/publicados": "Publicados",
  "/configuracion/estructuras": "Estructuras",
  "/configuracion/hooks": "Hooks",
  "/configuracion/ctas": "CTAs",
};

/** Con la barra inferior encargándose de Inicio / Plataformas / Ideas / Cuenta,
 *  la barra superior se queda solo con el buscador (en las raíces y en
 *  /contenido/buscar) y el botón de volver en el resto de pantallas —
 *  incluida /configuracion, que ya no es una raíz, se llega desde Cuenta. */
export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const enAuth = RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta));
  const enRaiz = pathname === "/contenido" || pathname === "/contenido/cuenta";
  const enBusqueda = pathname === "/contenido/buscar";
  const mostrarBusqueda = pathname === "/contenido" || enBusqueda;
  /** `/contenido` tiene la banda `OndaCadencia` detrás de la cabecera, así
   *  que el buscador y el icono de Tendencias van en blanco ahí. */
  const sobreOnda = pathname === "/contenido";
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  // En una raíz sin buscador (Cuenta) no hay nada que mostrar aquí — no dejar
  // la barra vacía, que el título de la página quede arriba.
  const vacia = enRaiz && !mostrarBusqueda;

  if (enAuth || vacia) return null;

  return (
    <div className="relative z-10 flex h-14 items-center gap-2 px-4">
      {!enRaiz && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-primary text-text-secondary"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      )}

      {TITULOS[pathname] && <h1 className="pl-2 text-h1">{TITULOS[pathname]}</h1>}

      {mostrarBusqueda ? (
        <form action="/contenido/buscar" className="flex-1">
          {sobreOnda ? (
            <div className="flex items-center gap-2 rounded-full bg-white py-2.5 px-4 shadow-md">
              <Search size={16} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
              <input
                key={query}
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Buscar por título o etiqueta…"
                style={{ "--input-bg": "transparent" } as React.CSSProperties}
                className="w-full min-w-0 flex-1 bg-transparent text-body text-text-primary focus:outline-none"
              />
            </div>
          ) : (
            <div className="relative">
              <Search
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                key={query}
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Buscar por título o etiqueta…"
                style={{ "--input-bg": "transparent" } as React.CSSProperties}
                className="w-full border-b border-border bg-transparent py-2 pr-3 pl-9 text-body text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </form>
      ) : (
        <div className="flex-1" />
      )}

      {pathname === "/contenido" && (
        <Link
          href="/contenido/tendencias"
          aria-label="Tendencias"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85"
        >
          <TrendingUp size={20} strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}
