"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Search, Settings } from "lucide-react";

const RUTAS_AUTH = [
  "/login",
  "/registro",
  "/olvide-password",
  "/restablecer-password",
  "/auth",
  "/legal",
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const enConfiguracion = pathname.startsWith("/configuracion");
  const enAuth = RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta));
  const enRaiz = pathname === "/contenido" || pathname === "/configuracion";
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  if (enAuth) return null;

  return (
    <div className="flex h-14 items-center gap-2 px-4">
      {!enRaiz ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-primary text-text-secondary"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      ) : enConfiguracion ? (
        <div className="flex-1" />
      ) : (
        <form action="/contenido/buscar" className="flex-1">
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
              className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </div>
        </form>
      )}

      {!enRaiz && <div className="flex-1" />}

      <Link
        href={enConfiguracion ? "/contenido" : "/configuracion"}
        aria-label={enConfiguracion ? "Volver a Contenido" : "Configuración"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg-primary text-text-secondary"
      >
        {enConfiguracion ? (
          <ArrowLeft size={20} strokeWidth={1.5} />
        ) : (
          <Settings size={20} strokeWidth={1.5} />
        )}
      </Link>
    </div>
  );
}
