"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { crearIdeaRapida } from "@/app/contenido/_shared/ideaRapidaActions";

function LimpiarAlGuardar({ formRef }: { formRef: React.RefObject<HTMLFormElement | null> }) {
  const { pending } = useFormStatus();
  const estabaEnviando = useRef(false);

  useEffect(() => {
    if (estabaEnviando.current && !pending) {
      formRef.current?.reset();
    }
    estabaEnviando.current = pending;
  }, [pending, formRef]);

  return null;
}

export function CapturaRapidaForm({ plataformas }: { plataformas: Plataforma[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={crearIdeaRapida}
      className="flex flex-col gap-2 rounded-md border border-border bg-bg-primary p-4"
    >
      <LimpiarAlGuardar formRef={formRef} />
      <span className="text-h3 text-text-secondary">¿Qué idea se te acaba de ocurrir?</span>
      <div className="flex gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Escríbela antes de que se te olvide…"
          className="flex-1 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
        <select
          name="plataforma"
          className="rounded-sm border border-border bg-bg-primary px-2 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        >
          {plataformas.map((p) => (
            <option key={p} value={p}>
              {PLATAFORMA_LABEL[p]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        Guardar idea
      </button>
    </form>
  );
}
