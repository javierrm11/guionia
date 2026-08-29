import { Loader2 } from "lucide-react";

export function EstadisticasVideoLoader({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
      <h2 className="text-h2">{titulo}</h2>
      <div className="flex h-16 items-center justify-center gap-2 text-text-secondary">
        <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
        <span className="text-small">Cargando estadísticas…</span>
      </div>
    </div>
  );
}
