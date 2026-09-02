import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { NumeroAnimado } from "@/components/NumeroAnimado";

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
    <div className="flex flex-col gap-2 rounded-md bg-bg-primary p-4 lg:gap-2.5 lg:p-5">
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bg lg:h-9 lg:w-9">
          <Icon size={16} strokeWidth={1.5} className="text-accent lg:h-[18px] lg:w-[18px]" />
        </span>
      )}
      <span className="text-caption text-text-secondary lg:text-small">{etiqueta}</span>
      <span className="text-h2 lg:text-h1">
        <NumeroAnimado valor={actual} sufijo={sufijo} />
      </span>
      {anterior != null && <Delta actual={actual} anterior={anterior} />}
    </div>
  );
}
