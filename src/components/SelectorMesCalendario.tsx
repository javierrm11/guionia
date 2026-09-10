"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { MES_LABEL, pad2 } from "@/lib/contenido";

/** Título "Marzo 2026" del calendario mensual — un botón que abre una hoja
 *  inferior con año (flechas ‹ › ) y una rejilla de 12 meses, mismo patrón
 *  que la hoja "¿Dónde publicas?" de `NuevoGuionFab`. Sustituye a los dos
 *  `<select>` nativos que llevaba antes (feos y difíciles de tocar en
 *  móvil). */
export function SelectorMesCalendario({
  base,
  anio,
  mes,
}: {
  /** Ruta antes de `/{anio}/{mes}`, p. ej. `/contenido/youtube/videos`. */
  base: string;
  anio: number;
  mes: number;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [anioHoja, setAnioHoja] = useState(anio);

  function abrir() {
    setAnioHoja(anio);
    setAbierto(true);
  }

  function elegirMes(mesElegido: number) {
    setAbierto(false);
    router.push(`${base}/${anioHoja}/${pad2(mesElegido)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="flex items-center gap-1 border-b border-border pb-0.5 text-h1 font-medium"
      >
        {MES_LABEL[mes - 1]} {anio}
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className="text-text-secondary"
        />
      </button>

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-40">
            <style>{`
            @keyframes selector-mes-fondo { from { opacity: 0; } to { opacity: 1; } }
            @keyframes selector-mes-hoja { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setAbierto(false)}
              className="absolute inset-0 bg-black/40"
              style={{ animation: "selector-mes-fondo 0.2s ease-out" }}
            />
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-t-md bg-bg-primary p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:inset-x-auto md:right-1/2 md:bottom-6 md:w-80 md:translate-x-1/2 md:rounded-md"
              style={{ animation: "selector-mes-hoja 0.25s ease-out" }}
            >
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setAnioHoja((a) => a - 1)}
                  aria-label="Año anterior"
                  className="p-1 text-text-secondary"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <span className="text-h2 font-display">{anioHoja}</span>
                <button
                  type="button"
                  onClick={() => setAnioHoja((a) => a + 1)}
                  aria-label="Año siguiente"
                  className="p-1 text-text-secondary"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MES_LABEL.map((label, i) => {
                  const numeroMes = i + 1;
                  const activo = anioHoja === anio && numeroMes === mes;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => elegirMes(numeroMes)}
                      className={`rounded-sm p-2.5 text-center text-body ${
                        activo
                          ? "bg-accent text-white"
                          : "bg-bg-secondary text-text-primary active:bg-accent-bg"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
