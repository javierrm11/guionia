"use client";

import { useState } from "react";
import Image from "next/image";

/** Avatar de la cabecera de `/contenido/cuenta` con fallback a la inicial
 *  del nombre si la imagen no carga — las URLs de avatar de TikTok son
 *  firmadas y caducan al cabo de unas horas, así que la guardada en la
 *  conexión puede dejar de servir la imagen antes de que se refresque
 *  (`CuentaTiktokSection.tsx` la actualiza en cada visita, pero la
 *  cabecera se pinta antes de que eso llegue a ejecutarse). */
export function AvatarCuenta({
  src,
  nombre,
}: {
  src: string | null;
  nombre: string;
}) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return (
      <span className="font-display text-h1 text-white">
        {nombre[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="96px"
      className="object-cover"
      onError={() => setFallo(true)}
    />
  );
}
