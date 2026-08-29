"use client";

import { useFormStatus } from "react-dom";
import { CargandoOverlay } from "@/components/CargandoOverlay";

/** Versión de `CargandoOverlay` para dentro de un `<form>` — usa
 *  `useFormStatus`, así que tiene que ser descendiente del formulario que
 *  quiere vigilar. */
export function EnviandoOverlay({ mensaje }: { mensaje: string }) {
  const { pending } = useFormStatus();
  return <CargandoOverlay visible={pending} mensaje={mensaje} />;
}
