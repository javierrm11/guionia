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

/** Con la barra inferior encargándose de Inicio / Ideas / Configuración, la
 *  barra superior se queda solo con el buscador (en las raíces y en
 *  /contenido/buscar) y el botón de volver en el resto de pantallas. */
export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const enAuth = RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta));
  const enRaiz =
    pathname === "/contenido" ||
    pathname === "/contenido/plataformas" ||
    pathname === "/configuracion";
  const enBusqueda = pathname === "/contenido/buscar";
  const mostrarBusqueda = pathname === "/contenido" || enBusqueda;
  /** `/contenido` tiene la banda `OndaCadencia` detrás de la cabecera, así
   *  que el buscador y el icono de Tendencias van en blanco ahí. */
  const sobreOnda = pathname === "/contenido";
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  if (enAuth) return null;

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

      {mostrarBusqueda ? (
        <form action="/contenido/buscar" className="flex-1">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.5}
              className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 ${
                sobreOnda ? "text-white/85" : "text-text-disabled"
              }`}
            />
            <input
              key={query}
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por título o etiqueta…"
              style={
                {
                  "--input-bg": "transparent",
                  ...(sobreOnda ? { "--placeholder-color": "rgba(255,255,255,0.85)" } : {}),
                } as React.CSSProperties
              }
              className={`w-full border-b bg-transparent py-2 pr-3 pl-9 text-body focus:outline-none ${
                sobreOnda
                  ? "border-white/40 text-white focus:border-white"
                  : "border-border text-text-primary focus:border-accent"
              }`}
            />
          </div>
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
