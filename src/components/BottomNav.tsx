"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Lightbulb, Settings } from "lucide-react";

const RUTAS_AUTH = [
  "/login",
  "/registro",
  "/olvide-password",
  "/restablecer-password",
  "/auth",
  "/legal",
];

const ITEMS = [
  { href: "/contenido", label: "Inicio", icon: Home, prefijo: "/contenido" },
  {
    href: "/contenido/plataformas",
    label: "Plataformas",
    icon: LayoutGrid,
    prefijo: "/contenido/plataformas",
  },
  { href: "/contenido/ideas", label: "Ideas", icon: Lightbulb, prefijo: "/contenido/ideas" },
  { href: "/configuracion", label: "Ajustes", icon: Settings, prefijo: "/configuracion" },
] as const;

/** Barra de navegación inferior flotante (cristal). El ítem activo se marca
 *  con fondo --accent-bg; iconos a 20px, como indica CLAUDE.md. */
export function BottomNav() {
  const pathname = usePathname();
  if (RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta))) return null;

  const activo = (prefijo: string) =>
    prefijo === "/contenido"
      ? pathname.startsWith("/contenido") &&
        !pathname.startsWith("/contenido/ideas") &&
        !pathname.startsWith("/contenido/plataformas")
      : pathname.startsWith(prefijo);

  return (
    <nav className="fixed inset-x-4 bottom-4 z-20 flex items-center gap-1 rounded-md bg-bg-secondary p-2">
      {ITEMS.map(({ href, label, icon: Icon, prefijo }) => {
        const esActivo = activo(prefijo);
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
