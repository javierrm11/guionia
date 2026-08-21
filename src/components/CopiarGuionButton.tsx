"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarGuionButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin acceso al portapapeles (permiso denegado, contexto no seguro...): no hacemos nada.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="flex items-center gap-2 self-start rounded-sm border border-border px-3 py-1.5 text-small text-text-primary active:bg-bg-secondary"
    >
      {copiado ? (
        <Check size={14} strokeWidth={1.5} className="text-success" />
      ) : (
        <Copy size={14} strokeWidth={1.5} />
      )}
      {copiado ? "Copiado" : "Copiar guion completo"}
    </button>
  );
}
