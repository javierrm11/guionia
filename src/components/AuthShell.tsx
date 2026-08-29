import type { ReactNode } from "react";
import Image from "next/image";

/** Layout compartido de login/registro. En móvil, foto en franja superior
 *  (dentro del flujo, 30vh) con la tarjeta solapándose por encima (`-mt-7`,
 *  el badge del logo a caballo en la costura). En tablet/escritorio (`md:`)
 *  la foto pasa a fondo fijo de toda la página (`md:fixed md:inset-0`) y la
 *  tarjeta se convierte en una caja independiente centrada sobre ella — ya
 *  no hay solape que calcular, así que el badge vuelve a ser un hijo normal
 *  dentro de la caja (con margen negativo propio solo en móvil para asomar
 *  por encima del borde de la tarjeta). */
export function AuthShell({
  children,
  foto,
}: {
  children: ReactNode;
  foto: string;
}) {
  return (
    <div className="relative flex flex-1 flex-col md:items-center md:justify-center md:p-8">
      <div className="relative min-h-[25vh] flex-none overflow-hidden md:fixed md:inset-0 md:min-h-0">
        <Image src={foto} alt="" fill priority sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0 md:backdrop-brightness-[0.8]"
          style={{
            backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0) 45%)",
          }}
        />
      </div>

      <div className="relative z-10 -mt-7 flex flex-1 flex-col items-center rounded-t-[28px] bg-bg-secondary md:mt-0 md:w-full md:max-w-md md:flex-none md:rounded-md md:shadow-2xl">
        <span className="relative -mt-8 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-secondary shadow-lg md:mt-6">
          <Image src="/logo/logo.jpg" alt="Guionia" fill className="object-cover" />
        </span>

        <div className="flex w-full flex-1 flex-col gap-6 px-6 pt-4 pb-6 md:pb-8">{children}</div>
      </div>
    </div>
  );
}
