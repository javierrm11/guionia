"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { obtenerPlataformasActivas } from "@/app/contenido/_shared/plataformasActivasAction";

/** Botón "+" central de la barra inferior — abre un modal para elegir
 *  plataforma y lleva directo a crear un vídeo nuevo en esa plataforma.
 *  El modal se porta a `document.body`: `BottomNav` (`fixed`, `z-20`) crea su
 *  propio contexto de apilamiento, así que un `z-40` anidado ahí dentro no
 *  lograría superar a `CapturaFlotante` (`z-30`, hermano de `BottomNav`). */
export function NuevoGuionFab() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [plataformas, setPlataformas] = useState<Plataforma[] | null>(null);

  useEffect(() => {
    if (abierto && plataformas === null) {
      obtenerPlataformasActivas().then(setPlataformas);
    }
  }, [abierto, plataformas]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Crear guion"
        className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent active:bg-accent-hover"
        style={{ boxShadow: "0 8px 20px rgba(108,92,224,0.4)" }}
      >
        <Plus size={24} strokeWidth={1.5} className="text-white" />
      </button>

      {abierto &&
        createPortal(
        <div className="fixed inset-0 z-40">
          <style>{`
            @keyframes nuevo-guion-fondo { from { opacity: 0; } to { opacity: 1; } }
            @keyframes nuevo-guion-hoja { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-black/40"
            style={{ animation: "nuevo-guion-fondo 0.2s ease-out" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-t-md bg-bg-primary p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-80 lg:rounded-md"
            style={{ animation: "nuevo-guion-hoja 0.25s ease-out" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-h2">¿Dónde publicas?</span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="p-1 text-text-disabled"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {(plataformas ?? []).map((plataforma) => {
                const Icon = PLATAFORMA_ICON[plataforma];
                const tono = PLATAFORMA_TONO[plataforma];
                return (
                  <button
                    key={plataforma}
                    type="button"
                    onClick={() => router.push(`/contenido/${plataforma}/videos/nueva`)}
                    className="flex items-center gap-3 rounded-md bg-bg-secondary p-3 text-left active:bg-accent-bg"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                      style={{ backgroundColor: tono }}
                    >
                      <Icon size={18} strokeWidth={1.5} className="text-white" />
                    </span>
                    <span className="text-body text-text-primary">{PLATAFORMA_LABEL[plataforma]}</span>
                  </button>
                );
              })}
              {plataformas !== null && plataformas.length === 0 && (
                <p className="text-small text-text-disabled">
                  Todavía no tienes ninguna plataforma activa.
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
