/** Sustituye al antiguo gauge circular — mismo % de la cadencia semanal,
 *  pero como barra horizontal para ocupar mucho menos alto (el gauge dejaba
 *  poco sitio visible antes de llegar a "Hoy"/Tendencias en móvil).
 *  Blanca sobre `--ai`, igual que el gauge que sustituye. */
export function BarraCadencia({ porcentaje }: { porcentaje: number }) {
  const pct = Math.min(100, Math.max(0, porcentaje));

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      <span className="font-display text-3xl font-bold text-white" style={{ letterSpacing: "-1px" }}>
        {Math.round(pct)}%
      </span>
      <div className="h-2 w-full rounded-full bg-white/25">
        <div
          className="h-2 rounded-full bg-white transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
