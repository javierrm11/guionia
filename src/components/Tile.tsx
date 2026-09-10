import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Tile({
  href,
  label,
  icon: Icon,
  badge,
  fondo = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Contador pequeño en la esquina — cuántas filas hay detrás de este
   *  tile (cadencia fija, plantilla, papelera...). Se omite si es 0. */
  badge?: number;
  /** Fondo blanco sólido (`bg-bg-primary`) en vez de transparente — para
   *  cuando el tile se apoya justo donde termina `OndaCadencia` y, sin
   *  fondo propio, se transparentaba dejando ver la curva morada por
   *  detrás (bienvenida de `/contenido` sin cadencia todavía). */
  fondo?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border p-4 transition-transform duration-100 hover:opacity-70 active:scale-95 lg:min-h-28 lg:gap-3 lg:p-5 ${
        fondo ? "bg-bg-primary" : ""
      }`}
    >
      {!!badge && (
        <span className="absolute top-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-bg px-1 text-caption text-text-secondary">
          {badge}
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent lg:h-12 lg:w-12">
        <Icon
          size={20}
          strokeWidth={1.5}
          className="text-white lg:h-[22px] lg:w-[22px]"
        />
      </span>
      <span className="text-h3 text-center text-text-primary">{label}</span>
    </Link>
  );
}
