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
      className="flex items-center gap-2 rounded-sm px-4 py-2 text-body text-text-primary active:opacity-70"
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
