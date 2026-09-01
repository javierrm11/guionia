"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CapturaRapidaForm } from "@/components/CapturaRapidaForm";
import type { Plataforma } from "@/lib/plataformas";

/** Alternativa a esperar a que aparezca `CapturaFlotante` — un "+" junto a
 *  "Ver todas" en la sección Ideas de Control que despliega el mismo
 *  `CapturaRapidaForm` ahí mismo, y se colapsa solo al guardar.
 *  El formulario se queda siempre montado (solo se le anima el alto vía el
 *  truco de grid `0fr`/`1fr`) en vez de mostrarse/ocultarse de golpe —
 *  efecto secundario: si se cierra a medio rellenar, el texto se conserva
 *  al volver a abrirlo. */
export function CapturaIdeaInline({ plataformas }: { plataformas: Plataforma[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex flex-col">
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="animate-escala-entrada flex items-center gap-1 text-caption text-accent"
        >
          <Plus size={14} strokeWidth={2} />
          Nueva idea
        </button>
      )}

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="rounded-md border border-border p-4">
            <CapturaRapidaForm plataformas={plataformas} onGuardado={() => setAbierto(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
