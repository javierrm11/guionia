"use client";

import { useRef, useState } from "react";
import { AiEscenaButton } from "@/components/AiEscenaButton";
import type { TipoEscena } from "@/lib/contenido";
import type { Plataforma } from "@/lib/plataformas";
import type { EscenaContexto } from "@/lib/ai/gemini";

export function EscenaTextoEditor({
  escenaId,
  redirectTo,
  textoInicial,
  tipoEscena,
  duracionSegundos,
  plataforma,
  tituloIdea,
  pilar,
  otrasEscenas,
  guardarAction,
}: {
  escenaId: string;
  redirectTo: string;
  textoInicial: string;
  tipoEscena: TipoEscena;
  duracionSegundos: number | null;
  plataforma: Plataforma;
  tituloIdea: string;
  pilar: string | null;
  otrasEscenas: EscenaContexto[];
  guardarAction: (formData: FormData) => void | Promise<void>;
}) {
  const [texto, setTexto] = useState(textoInicial);
  const formRef = useRef<HTMLFormElement>(null);
  const ultimoGuardado = useRef(textoInicial);

  return (
    <div className="flex flex-col gap-2">
      <AiEscenaButton
        contexto={{ plataforma, tituloIdea, pilar, tipoEscena, duracionSegundos, otrasEscenas }}
        obtenerTextoActual={() => texto}
        onResultado={(nuevoTexto) => {
          setTexto(nuevoTexto);
          ultimoGuardado.current = nuevoTexto;
          formRef.current?.requestSubmit();
        }}
      />

      <form ref={formRef} action={guardarAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={escenaId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <textarea
          name="texto"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={() => {
            if (texto !== ultimoGuardado.current) {
              ultimoGuardado.current = texto;
              formRef.current?.requestSubmit();
            }
          }}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
        <button
          type="submit"
          className="self-start rounded-sm border border-border px-3 py-1.5 text-small text-text-primary active:bg-bg-secondary"
        >
          Guardar texto
        </button>
      </form>
    </div>
  );
}
