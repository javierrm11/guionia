const CENTRO = 100;
const RADIO = 72;
const ANGULO_INICIO = 135; // grados; 0°=derecha, 90°=abajo (coords SVG, y hacia abajo)
const ANGULO_TOTAL = 270; // deja un hueco de 90° abajo, centrado
const LONGITUD_ARCO = 2 * Math.PI * RADIO * (ANGULO_TOTAL / 360); // ≈ 339.3

const TICKS: [number, number, number, number][] = [
  [40.6, 159.4, 33.5, 166.5],
  [20.1, 126.0, 10.6, 129.0],
  [17.0, 86.9, 7.2, 85.3],
  [32.0, 50.6, 24.0, 44.7],
  [61.9, 25.2, 57.3, 16.3],
  [100, 16, 100, 6],
  [138.1, 25.2, 142.7, 16.3],
  [168.0, 50.6, 176.0, 44.7],
  [183.0, 86.9, 192.8, 85.3],
  [179.9, 126.0, 189.4, 129.0],
  [159.4, 159.4, 166.5, 166.5],
];

function puntoEnAngulo(gradosAbs: number) {
  const rad = (gradosAbs * Math.PI) / 180;
  return { x: CENTRO + RADIO * Math.cos(rad), y: CENTRO + RADIO * Math.sin(rad) };
}

const PUNTO_INICIO = puntoEnAngulo(ANGULO_INICIO);
const PUNTO_FIN_ARCO = puntoEnAngulo(ANGULO_INICIO + ANGULO_TOTAL);
const ARCO = `M${PUNTO_INICIO.x} ${PUNTO_INICIO.y} A${RADIO} ${RADIO} 0 1 1 ${PUNTO_FIN_ARCO.x} ${PUNTO_FIN_ARCO.y}`;

/**
 * Gauge circular de la cadencia semanal (arco de 270° con marcas de reloj
 * alrededor) — versión blanca, pensada para ir sobre la onda azul (--ai) de
 * OndaCadencia, no sobre tarjeta blanca.
 */
export function GaugeCadencia({ porcentaje }: { porcentaje: number }) {
  const pct = Math.min(100, Math.max(0, porcentaje));
  const relleno = (LONGITUD_ARCO * pct) / 100;
  const puntoActual = puntoEnAngulo(ANGULO_INICIO + (ANGULO_TOTAL * pct) / 100);

  return (
    <div className="relative w-full" style={{ maxWidth: 150 }}>
      <svg viewBox="0 0 200 170" width="100%" style={{ display: "block" }}>
        {TICKS.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <path d={ARCO} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={14} strokeLinecap="round" />
        <path
          d={ARCO}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${relleno} ${LONGITUD_ARCO}`}
        />
        <circle cx={puntoActual.x} cy={puntoActual.y} r={7} fill="#FFFFFF" stroke="var(--ai)" strokeWidth={4} />
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <span className="text-h1 font-display font-bold text-white" style={{ letterSpacing: "-1px" }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}
