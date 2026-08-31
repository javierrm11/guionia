"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
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
  const [paso, setPaso] = useState<"titulo" | "plataforma">("titulo");
  const [titulo, setTitulo] = useState("");

  return (
    <form
      ref={formRef}
      action={crearIdeaRapida}
      className="flex flex-col gap-4"
    >
      <LimpiarAlGuardar
        formRef={formRef}
        onGuardado={() => {
          setPaso("titulo");
          setTitulo("");
          onGuardado?.();
        }}
      />

      {paso === "titulo" ? (
        <>
          <span className="text-h3 font-display font-semibold">Captura rápida</span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="¿Se te ha ocurrido algo? Anótalo…"
              style={{ "--input-bg": "transparent" } as React.CSSProperties}
              className="min-h-11 flex-1 border-b border-border px-0.5 py-2 text-body focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => titulo.trim() && setPaso("plataforma")}
              disabled={!titulo.trim()}
              className="shrink-0 rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="text-h3 font-display font-semibold">¿En qué plataforma?</span>

          <input type="hidden" name="titulo" value={titulo} />

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
            <button
              type="button"
              onClick={() => setPaso("titulo")}
              className="shrink-0 rounded-sm px-4 py-2 text-body text-text-secondary active:opacity-70"
            >
              Atrás
            </button>
            <SubmitButton
              className="flex-1 rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
              pendingLabel="Guardando…"
            >
              Guardar
            </SubmitButton>
          </div>
        </>
      )}
    </form>
  );
}
