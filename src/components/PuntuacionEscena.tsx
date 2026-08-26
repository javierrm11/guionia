"use client";

import { useMemo } from "react";
import { calcularPuntuacionEscena } from "@/lib/puntuacion";
import { Puntuacion } from "@/components/Puntuacion";
import type { TipoEscena } from "@/lib/contenido";

export function PuntuacionEscena({
  texto,
  tipoEscena,
  duracionSegundos,
}: {
  texto: string;
  tipoEscena: TipoEscena;
  duracionSegundos: number | null;
}) {
  const resultado = useMemo(
    () => calcularPuntuacionEscena(texto, tipoEscena, duracionSegundos),
    [texto, tipoEscena, duracionSegundos]
  );

  if (!(texto ?? "").trim()) return null;

  return <Puntuacion resultado={resultado} etiqueta="atracción hacia el espectador" />;
}
