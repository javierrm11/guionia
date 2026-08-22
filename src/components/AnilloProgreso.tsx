/** Anillo de progreso de la cadencia semanal. Solo SVG + tokens existentes. */
export function AnilloProgreso({
  hechas,
  objetivo,
  size = 104,
  grosor = 10,
}: {
  hechas: number;
  objetivo: number;
  size?: number;
  grosor?: number;
}) {
  const radio = (size - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const porcentaje = objetivo > 0 ? Math.min(100, (hechas / objetivo) * 100) : 0;
  const completo = objetivo > 0 && hechas >= objetivo;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radio}
          fill="none"
          stroke="var(--neutral-bg)"
          strokeWidth={grosor}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radio}
          fill="none"
          stroke={completo ? "var(--success)" : "var(--accent)"}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia - (circunferencia * porcentaje) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-h3 leading-none">
          {hechas}
          <span className="text-caption text-text-secondary">/{objetivo}</span>
        </span>
      </div>
    </div>
  );
}
