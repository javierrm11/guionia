import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const TONO_TILE: Record<"accent" | "ai" | "success", string> = {
  accent: "var(--accent-bg)",
  ai: "var(--ai-bg)",
  success: "var(--success-bg)",
};
const TONO_ICONO: Record<"accent" | "ai" | "success", string> = {
  accent: "var(--accent)",
  ai: "var(--ai)",
  success: "var(--success)",
};

export function Tile({
  href,
  label,
  icon: Icon,
  badge,
  fondo = false,
  tono,
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
  /** Superficie de color en vez de `border border-border` — solo para los
   *  tiles de acceso rápido de Control (ver "Superficies de color" en
   *  CLAUDE.md); el resto de tiles de la app (Configuración, Ideas, Cuenta…)
   *  no pasan esta prop y se quedan con el borde de siempre. */
  tono?: "accent" | "ai" | "success";
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-md p-4 transition-transform duration-100 hover:opacity-70 active:scale-95 lg:min-h-28 lg:gap-3 lg:p-5 ${
        tono ? "" : "border border-border"
      } ${fondo ? "bg-bg-primary" : ""}`}
      style={tono ? { backgroundColor: TONO_TILE[tono] } : undefined}
    >
      {!!badge && (
        <span className="absolute top-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-bg px-1 text-caption text-text-secondary">
          {badge}
        </span>
      )}
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent lg:h-12 lg:w-12"
        style={tono ? { backgroundColor: TONO_ICONO[tono] } : undefined}
      >
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
