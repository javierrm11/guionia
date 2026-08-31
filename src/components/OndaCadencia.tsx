const ALTURA_MIN = 305;
const ALTURA_MAX = 350;
const AMPLITUD = 28;
const ANCHO_VIEWBOX = 400;

/**
 * Banda decorativa detrás de la cabecera de Control: sube de tamaño con el
 * % de la cadencia semanal, sin texto propio — solo la forma. Reutiliza --ai
 * (el único azul del sistema). `alturaFija` permite anular el cálculo por
 * `porcentaje` en pantallas sin cadencia (p.ej. `/contenido/cuenta`), sin
 * tocar `ALTURA_MIN`/`ALTURA_MAX`, que siguen rigiendo Control.
 */
export function OndaCadencia({
  porcentaje,
  alturaFija,
}: {
  porcentaje: number;
  alturaFija?: number;
}) {
  const altura =
    alturaFija ??
    ALTURA_MIN + ((ALTURA_MAX - ALTURA_MIN) * Math.min(100, Math.max(0, porcentaje))) / 100;
  const base = altura - AMPLITUD;

  const d =
    `M0,0 L0,${base} ` +
    `C${ANCHO_VIEWBOX * 0.25},${base - AMPLITUD} ${ANCHO_VIEWBOX * 0.25},${base + AMPLITUD} ${ANCHO_VIEWBOX * 0.5},${base} ` +
    `C${ANCHO_VIEWBOX * 0.75},${base - AMPLITUD} ${ANCHO_VIEWBOX * 0.75},${base + AMPLITUD} ${ANCHO_VIEWBOX},${base} ` +
    `L${ANCHO_VIEWBOX},0 Z`;

  return (
    <svg
      viewBox={`0 0 ${ANCHO_VIEWBOX} ${altura}`}
      preserveAspectRatio="none"
      width="100%"
      height={altura}
      className="block"
    >
      <path d={d} fill="var(--ai)" />
    </svg>
  );
}
