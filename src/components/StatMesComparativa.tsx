import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

function formatoNumero(n: number) {
  return n.toLocaleString("es-ES");
}

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0) return null;
  const cambio = ((actual - anterior) / anterior) * 100;
  const sube = cambio >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-caption ${sube ? "text-success" : "text-danger"}`}>
      {sube ? <ArrowUp size={12} strokeWidth={2} /> : <ArrowDown size={12} strokeWidth={2} />}
      {Math.abs(Math.round(cambio))}%
    </span>
  );
}

/** Tarjeta de una métrica del mes en curso, con la variación respecto al mes anterior. */
export function StatMes({
  etiqueta,
  actual,
  anterior,
  sufijo = "",
  icon: Icon,
}: {
  etiqueta: string;
  actual: number;
  anterior: number | null;
  /** Añadido tras el número, p. ej. " h" para tiempo de visualización. */
  sufijo?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-bg-primary p-4">
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bg">
          <Icon size={16} strokeWidth={1.5} className="text-accent" />
        </span>
      )}
      <span className="text-caption text-text-secondary">{etiqueta}</span>
      <span className="text-h2">
        {formatoNumero(actual)}
        {sufijo}
      </span>
      {anterior != null && <Delta actual={actual} anterior={anterior} />}
    </div>
  );
}
