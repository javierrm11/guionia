"use client";

import { useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmButton({
  children,
  message,
  pendingLabel,
  className,
  ariaLabel,
  confirmLabel,
}: {
  children: ReactNode;
  message: string;
  pendingLabel?: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Texto del botón de confirmar dentro del modal — por defecto reutiliza
   *  `children` (vale si es texto plano; para un botón de solo icono hay que
   *  pasarlo explícito, p. ej. "Eliminar"). */
  confirmLabel?: ReactNode;
}) {
  const { pending } = useFormStatus();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        disabled={pending}
        aria-label={ariaLabel}
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        {pending ? (pendingLabel ?? children) : children}
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-[90vw] max-w-sm rounded-md border-0 bg-bg-primary p-5 text-text-primary backdrop:bg-black/50"
      >
        <p className="text-body">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-sm px-3 py-2 text-body text-text-primary active:bg-neutral-bg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              botonRef.current?.form?.requestSubmit();
            }}
            className="rounded-sm bg-badge-danger px-3 py-2 text-body text-white active:opacity-90"
          >
            {confirmLabel ?? children}
          </button>
        </div>
      </dialog>
    </>
  );
}
