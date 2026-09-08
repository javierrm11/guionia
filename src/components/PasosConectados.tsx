import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { RevelarAlScroll } from "@/components/RevelarAlScroll";

export type PasoConectado = {
  titulo: string;
  texto: string;
  icon: LucideIcon;
  extra?: ReactNode;
};

/** Pasos numerados — usado tanto en "Cómo empezar" (3 pasos, `destacado` +
 *  `enTarjeta`: sobre fondo con tinte de color, cada paso en su propia
 *  tarjeta blanca) como en "Cómo funciona" (4 pasos, `destacado` a secas,
 *  sobre fondo blanco liso, sin tarjeta). `destacado` cambia la línea que
 *  conecta cada icono con el siguiente (el modo por defecto) por el número
 *  en grande como marca de agua detrás del texto, más un ligero zigzag
 *  vertical entre pasos pares/impares en escritorio, en vez de la rejilla
 *  uniforme. En todos los casos cada paso se revela con fade+slide al
 *  entrar en el viewport (`RevelarAlScroll`, aparte por ser Client Component
 *  — este componente se queda como Server Component, ya que `pasos` trae
 *  referencias a componentes de icono que no se pueden pasar a un Client
 *  Component). La línea (`left-14`, `width: 100%`) llega justo hasta el
 *  siguiente icono porque ese margen coincide con el gap de la rejilla
 *  (ambos 56px = `lg:gap-14`) — hay que mantenerlos iguales si cambia el
 *  espaciado. */
export function PasosConectados({
  pasos,
  columnasDesktop,
  destacado = false,
  enTarjeta = false,
}: {
  pasos: PasoConectado[];
  columnasDesktop: 3 | 4;
  destacado?: boolean;
  enTarjeta?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-7 lg:grid lg:gap-14 ${
        columnasDesktop === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {pasos.map(({ icon: Icon, titulo, texto, extra }, i) => {
        const esUltimo = i === pasos.length - 1;
        const bajado = destacado && i % 2 === 1;

        return (
          <RevelarAlScroll
            key={titulo}
            delayMs={i * 90}
            className={`relative flex gap-4 lg:relative lg:flex-col ${bajado ? "lg:mt-10" : ""} ${
              enTarjeta
                ? "overflow-hidden rounded-2xl bg-bg-primary p-5 shadow-sm"
                : ""
            }`}
          >
            {!destacado && !esUltimo && (
              <span className="absolute top-5 left-14 hidden h-px w-full bg-border lg:block" />
            )}

            {destacado && (
              <span
                aria-hidden
                className="pointer-events-none absolute -top-8 -left-2 font-display text-7xl text-accent-bg select-none lg:-top-10 lg:text-8xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            )}

            <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent shadow-md">
              {!destacado && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 -left-2 hidden font-display text-2xl text-accent-bg select-none lg:block"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <Icon
                size={20}
                strokeWidth={1.5}
                className="relative text-white"
              />
            </span>
            <div className="relative z-10 flex min-w-0 flex-col gap-2">
              <h3 className="text-h3">{titulo}</h3>
              <p className="text-small text-text-secondary">{texto}</p>
              {extra}
            </div>
          </RevelarAlScroll>
        );
      })}
    </div>
  );
}
