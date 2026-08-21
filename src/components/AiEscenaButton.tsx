"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generarEscenaConIA } from "@/lib/ai/actions";
import type { GenerarEscenaInput } from "@/lib/ai/gemini";

type Contexto = Omit<GenerarEscenaInput, "modo" | "textoActual">;

export function AiEscenaButton({
  contexto,
  obtenerTextoActual,
  onResultado,
}: {
  contexto: Contexto;
  obtenerTextoActual: () => string;
  onResultado: (texto: string) => void;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generar() {
    setCargando(true);
    setError(null);

    const textoActual = obtenerTextoActual();
    const resultado = await generarEscenaConIA({
      ...contexto,
      modo: textoActual.trim() ? "mejorar" : "generar",
      textoActual,
    });

    setCargando(false);

    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }
    onResultado(resultado.texto);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={generar}
        disabled={cargando}
        aria-label="Generar o mejorar esta escena con IA"
        className="flex items-center gap-1.5 self-start rounded-sm bg-ai px-3 py-1.5 text-small text-white active:bg-ai-hover disabled:opacity-50"
      >
        <Sparkles size={14} strokeWidth={1.5} />
        {cargando ? "Generando…" : "Usar IA"}
      </button>
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
