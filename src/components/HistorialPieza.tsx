import { ESTADO_PIEZA_LABEL, type EventoHistorialPieza } from "@/lib/contenido";

function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  const dia = fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  const hora = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dia}, ${hora}`;
}

/** Línea de tiempo idea → guion escrito → grabado → editado → publicado —
 *  cada fila es un cambio de estado real registrado en `piezas_historial`
 *  (ver `registrarHistorialPieza` en `lib/contenido.ts`), no un paso fijo del
 *  pipeline: si una pieza vuelve atrás (ideas descartadas y restauradas) o
 *  salta pasos, se ve tal cual pasó. */
export function HistorialPieza({
  eventos,
}: {
  eventos: EventoHistorialPieza[];
}) {
  if (eventos.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-bg-primary p-4 shadow-sm lg:gap-3 lg:p-5">
      <h2 className="text-h2 lg:text-h1">Historial</h2>
      <ul className="flex flex-col">
        {eventos.map((evento, index) => {
          const esUltimo = index === eventos.length - 1;
          return (
            <li
              key={`${evento.estado}-${evento.created_at}`}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 size-2.5 shrink-0 rounded-full ${
                    esUltimo ? "bg-accent" : "bg-border"
                  }`}
                />
                {!esUltimo && <span className="w-px flex-1 bg-border" />}
              </div>
              <div
                className={`flex flex-1 items-baseline justify-between gap-3 ${esUltimo ? "pb-0" : "pb-4"}`}
              >
                <span
                  className={`text-body ${esUltimo ? "text-text-primary" : "text-text-secondary"}`}
                >
                  {ESTADO_PIEZA_LABEL[evento.estado] ?? evento.estado}
                </span>
                <span className="text-caption text-text-disabled whitespace-nowrap">
                  {formatearFecha(evento.created_at)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
