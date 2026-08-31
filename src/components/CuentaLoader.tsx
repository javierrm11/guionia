import { Loader2 } from "lucide-react";

export function CuentaLoader() {
  return (
    <div className="flex h-40 items-center justify-center gap-2 rounded-md border border-border p-4 text-text-secondary">
      <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
      <span className="text-small">Cargando estadísticas…</span>
    </div>
  );
}
