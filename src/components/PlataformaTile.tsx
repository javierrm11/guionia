import type { Plataforma } from "@/lib/plataformas";

/** Tono por plataforma — colores propios de marca, sólidos sobre fondo blanco. */
export const PLATAFORMA_TONO: Record<Plataforma, string> = {
  tiktok: "#111114",
  youtube: "#ff3b30",
};

/** Tinte suave del tono de marca — superficie de color de la tarjeta de
 *  plataforma en `/contenido/plataformas` (ver "Superficies de color" en
 *  CLAUDE.md), no solo del icono cuadrado. TikTok reutiliza `--neutral-bg`
 *  (ya es ese mismo gris cálido); YouTube tiene su propio `--brand-youtube-bg`
 *  porque no hay ningún tono semántico que se le parezca. */
export const PLATAFORMA_TONO_BG: Record<Plataforma, string> = {
  tiktok: "var(--neutral-bg)",
  youtube: "var(--brand-youtube-bg)",
};
