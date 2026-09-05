"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarEnlaceReferido({ enlace }: { enlace: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin acceso al portapapeles (permiso denegado, contexto no seguro...): no hacemos nada.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-body text-text-secondary">{enlace}</span>
      <button
        type="button"
        onClick={copiar}
        className="flex shrink-0 items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
      >
        {copiado ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
