"use client";

import { useState, type ReactNode } from "react";

/** Envuelve `CalendarioPlataformas` para animar un slide horizontal al
 *  cambiar de semana vía `?semana=`, en la dirección de la navegación
 *  (adelante = entra desde la derecha, atrás = desde la izquierda) — sin
 *  esto, el contenido se sustituye de golpe al refrescar la ruta.
 *  Compara `semanaKey` con la del render anterior guardada en estado
 *  (patrón "derivar estado de props" de React, sin useEffect) para decidir
 *  la dirección antes de que se monte la nueva semana. */
export function CalendarioSemanaTransicion({
  semanaKey,
  children,
}: {
  semanaKey: string;
  children: ReactNode;
}) {
  const [anterior, setAnterior] = useState(semanaKey);
  const [direccion, setDireccion] = useState<1 | -1>(1);

  if (semanaKey !== anterior) {
    setDireccion(anterior < semanaKey ? 1 : -1);
    setAnterior(semanaKey);
  }

  return (
    <div className="overflow-hidden">
      <div
        key={semanaKey}
        className={direccion === 1 ? "animate-deslizar-derecha" : "animate-deslizar-izquierda"}
      >
        {children}
      </div>
    </div>
  );
}
