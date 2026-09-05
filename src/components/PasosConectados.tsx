import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PasoConectado = {
  titulo: string;
  texto: string;
  icon: LucideIcon;
  extra?: ReactNode;
};

/** Pasos numerados y conectados por una línea horizontal en escritorio —
 *  usado tanto en "Cómo empezar" (3 pasos) como en "Cómo funciona" (4 pasos)
 *  de la landing. La línea (`left-14`, `width: 100%`) llega justo hasta el
 *  siguiente icono porque ese margen coincide con el gap de la rejilla
 *  (ambos 56px = `lg:gap-14`) — hay que mantenerlos iguales si cambia el
 *  espaciado. */
export function PasosConectados({
  pasos,
  columnasDesktop,
}: {
  pasos: PasoConectado[];
  columnasDesktop: 3 | 4;
}) {
  return (
    <div
      className={`flex flex-col gap-7 lg:grid lg:gap-14 ${
        columnasDesktop === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {pasos.map(({ icon: Icon, titulo, texto, extra }, i) => (
        <div key={titulo} className="flex gap-4 lg:relative lg:flex-col">
          {i < pasos.length - 1 && (
            <span className="absolute top-5 left-14 hidden h-px w-full bg-border lg:block" />
          )}
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-3 -left-2 hidden font-display text-2xl text-accent-bg select-none lg:block"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <Icon size={20} strokeWidth={1.5} className="relative text-white" />
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-h3">{titulo}</span>
            <p className="text-small text-text-secondary">{texto}</p>
            {extra}
          </div>
        </div>
      ))}
    </div>
  );
}
