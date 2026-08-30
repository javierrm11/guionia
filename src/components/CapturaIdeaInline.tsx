"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CapturaRapidaForm } from "@/components/CapturaRapidaForm";
import type { Plataforma } from "@/lib/plataformas";

/** Alternativa a esperar a que aparezca `CapturaFlotante` — un "+" junto a
 *  "Ver todas" en la sección Ideas de Control que despliega el mismo
 *  `CapturaRapidaForm` ahí mismo, y se colapsa solo al guardar. */
export function CapturaIdeaInline({ plataformas }: { plataformas: Plataforma[] }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1 text-caption text-accent"
      >
        <Plus size={14} strokeWidth={2} />
        Nueva idea
      </button>
    );
  }

  return (
    <div className="rounded-md bg-bg-primary p-4">
      <CapturaRapidaForm plataformas={plataformas} onGuardado={() => setAbierto(false)} />
    </div>
  );
}
