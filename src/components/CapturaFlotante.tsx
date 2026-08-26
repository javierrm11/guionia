"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CapturaRapidaForm } from "@/components/CapturaRapidaForm";
import type { Plataforma } from "@/lib/plataformas";

const RETRASO_MS = 2000;

/**
 * Captura de idea como notificación flotante — aparece sola a los 2s de
 * entrar en Control, en vez de ir siempre fija en la pantalla.
 */
export function CapturaFlotante({ plataformas }: { plataformas: Plataforma[] }) {
  const [mostrar, setMostrar] = useState(false);
  const [cerrada, setCerrada] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrar(true), RETRASO_MS);
    return () => clearTimeout(temporizador);
  }, []);

  if (!mostrar || cerrada) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-30 lg:inset-x-auto lg:right-6 lg:w-96">
      <style>{`
        @keyframes captura-flotante-entrada {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="relative flex flex-col gap-3 rounded-md bg-bg-primary p-4 pr-9"
        style={{ animation: "captura-flotante-entrada 0.35s ease-out" }}
      >
        <button
          type="button"
          onClick={() => setCerrada(true)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1 text-text-disabled"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <CapturaRapidaForm plataformas={plataformas} onGuardado={() => setCerrada(true)} />
      </div>
    </div>
  );
}
