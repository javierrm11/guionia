import { Home, LayoutGrid, Lightbulb, User, type LucideIcon } from "lucide-react";

export const RUTAS_AUTH = [
  "/login",
  "/registro",
  "/olvide-password",
  "/restablecer-password",
  "/auth",
  "/legal",
];

export type ItemNav = {
  href: string;
  label: string;
  icon: LucideIcon;
  prefijo: string;
};

/** Destinos de la navegación principal — compartidos por BottomNav (móvil/tablet) y Sidebar (escritorio). */
export const ITEMS_NAV: readonly ItemNav[] = [
  { href: "/contenido", label: "Inicio", icon: Home, prefijo: "/contenido" },
  {
    href: "/contenido/plataformas",
    label: "Plataformas",
    icon: LayoutGrid,
    prefijo: "/contenido/plataformas",
  },
  { href: "/contenido/ideas", label: "Ideas", icon: Lightbulb, prefijo: "/contenido/ideas" },
  { href: "/contenido/cuenta", label: "Cuenta", icon: User, prefijo: "/contenido/cuenta" },
];

/** `/` es la landing pública (marketing) — sin el "chrome" de la app
 *  (Sidebar/TopBar/BottomNav), igual que las rutas de auth. Comparación
 *  exacta (no `startsWith`) porque toda ruta empieza por "/". */
export function esRutaSinChrome(pathname: string) {
  return pathname === "/" || RUTAS_AUTH.some((ruta) => pathname.startsWith(ruta));
}

export function esRutaActiva(pathname: string, prefijo: string) {
  return prefijo === "/contenido"
    ? pathname.startsWith("/contenido") &&
        !pathname.startsWith("/contenido/ideas") &&
        !pathname.startsWith("/contenido/plataformas") &&
        !pathname.startsWith("/contenido/cuenta")
    : pathname.startsWith(prefijo);
}
