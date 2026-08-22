import type { Plataforma } from "@/lib/plataformas";

/** Tono por plataforma. Reutiliza los tonos del degradado "Atardecer" +
 *  el acento — salvo LinkedIn, que usa una variante más clara del violeta
 *  índigo (`--bg-body-a` crudo se lee demasiado oscuro/apagado a tamaño de
 *  icono pequeño). */
export const PLATAFORMA_TONO: Record<Plataforma, string> = {
  tiktok: "var(--bg-body-c)",
  instagram: "var(--bg-body-b)",
  linkedin: "#8b5cf6",
  youtube: "var(--accent)",
};
