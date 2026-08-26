"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUp } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { crearIdeaRapida } from "@/app/contenido/_shared/ideaRapidaActions";

function LimpiarAlGuardar({
  formRef,
  onGuardado,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  onGuardado?: () => void;
}) {
  const { pending } = useFormStatus();
  const estabaEnviando = useRef(false);

  useEffect(() => {
    if (estabaEnviando.current && !pending) {
      formRef.current?.reset();
      onGuardado?.();
    }
    estabaEnviando.current = pending;
  }, [pending, formRef, onGuardado]);

  return null;
}

export function CapturaRapidaForm({
  plataformas,
  onGuardado,
}: {
  plataformas: Plataforma[];
  onGuardado?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={crearIdeaRapida} className="flex flex-col gap-4">
      <LimpiarAlGuardar formRef={formRef} onGuardado={onGuardado} />

      <span className="text-h3 font-display font-semibold">¿Qué idea se te acaba de ocurrir?</span>

      {/* Mismo campo `plataforma` que antes, en chips en vez de <select>. */}
      <div className="flex flex-wrap gap-2">
        {plataformas.map((p, i) => (
          <label key={p} className="cursor-pointer">
            <input
              type="radio"
              name="plataforma"
              value={p}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <span className="text-caption block rounded-full bg-neutral-bg px-3 py-1.5 text-text-secondary peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent-bg">
              {PLATAFORMA_LABEL[p]}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Escríbela antes de que se te olvide…"
          style={{ "--input-bg": "transparent" } as React.CSSProperties}
          className="min-h-11 flex-1 border-b border-border px-0.5 py-2 text-body focus:border-accent focus:outline-none"
        />
        <SubmitButton
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white active:bg-accent-hover disabled:opacity-60"
          pendingLabel={<span className="text-caption">…</span>}
        >
          <ArrowUp size={20} strokeWidth={1.5} />
          <span className="sr-only">Guardar idea</span>
        </SubmitButton>
      </div>
    </form>
  );
}
