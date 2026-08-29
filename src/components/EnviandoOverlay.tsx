"use client";

import { useFormStatus } from "react-dom";

/** Overlay a pantalla completa mientras el formulario padre está enviándose
 *  (`useFormStatus`, así que tiene que ser descendiente del `<form>`) — fondo
 *  oscurecido y difuminado, tres puntos con rebote escalonado y un mensaje,
 *  para que iniciar sesión/crear cuenta no se sienta como que no ha pasado
 *  nada mientras se espera la respuesta del servidor. */
export function EnviandoOverlay({ mensaje }: { mensaje: string }) {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="text-body font-medium text-white">{mensaje}</p>
    </div>
  );
}
