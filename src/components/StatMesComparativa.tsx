import { ArrowDown, ArrowUp } from "lucide-react";

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
}: {
  etiqueta: string;
  actual: number;
  anterior: number | null;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-bg-primary p-4">
      <span className="text-caption text-text-secondary">{etiqueta}</span>
      <span className="text-h2">{formatoNumero(actual)}</span>
      {anterior != null && <Delta actual={actual} anterior={anterior} />}
    </div>
  );
}
