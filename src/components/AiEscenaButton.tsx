"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import { generarEscenaConIA } from "@/lib/ai/actions";
import type { GenerarEscenaInput } from "@/lib/ai/gemini";
import {
  asegurarCargado,
  establecer,
  leer,
  leerServidor,
  suscribir,
} from "@/lib/ai/usosRestantesStore";

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
  const restantes = useSyncExternalStore(suscribir, leer, leerServidor);

  useEffect(() => {
    asegurarCargado();
  }, []);

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
    establecer(resultado.restantes);

    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }
    onResultado(resultado.texto);
  }

  const sinUsos = restantes === 0;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={generar}
        disabled={cargando || sinUsos}
        aria-label="Generar o mejorar esta escena con IA"
        className="flex items-center gap-1.5 self-start rounded-sm bg-ai px-3 py-1.5 text-small text-white active:bg-ai-hover disabled:opacity-50"
      >
        <Sparkles size={14} strokeWidth={1.5} />
        {cargando
          ? "Generando…"
          : `Usar IA${restantes != null ? ` (${restantes})` : ""}`}
      </button>
      {sinUsos && !error && (
        <span className="text-caption text-text-secondary">
          Sin usos de IA por hoy — vuelve mañana.
        </span>
      )}
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
