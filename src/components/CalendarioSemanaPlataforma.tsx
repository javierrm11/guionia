import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  DIA_SEMANA_LABEL,
  PLATAFORMA_ICON,
  addDaysISO,
  type Plataforma,
} from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { Badge } from "@/components/Badge";
import {
  ESTADOS_VIDEO,
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  MES_LABEL,
} from "@/lib/contenido";

function formatearRangoSemana(inicio: string, fin: string) {
  const [, mesInicio, diaInicio] = inicio.split("-").map(Number);
  const [, mesFin, diaFin] = fin.split("-").map(Number);
  if (mesInicio === mesFin)
    return `${diaInicio}–${diaFin} ${MES_LABEL[mesInicio - 1]}`;
  return `${diaInicio} ${MES_LABEL[mesInicio - 1].slice(0, 3)} – ${diaFin} ${MES_LABEL[mesFin - 1].slice(0, 3)}`;
}

/** Vista semanal del calendario de una sola plataforma — mismo patrón de
 *  lista día a día que `CalendarioPlataformas.tsx` (todas las plataformas
 *  juntas), pero acotado aquí a una, para cuando la rejilla mensual queda
 *  demasiado apretada (móvil, o mucho volumen de vídeos). */
export async function CalendarioSemanaPlataforma({
  plataforma,
  semanaInicio,
  rutaBase,
}: {
  plataforma: Plataforma;
  semanaInicio: string;
  /** `/contenido/{plataforma}/videos` — base para los enlaces de cada día y de navegación de semana. */
  rutaBase: string;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(semanaInicio, i));
  const semanaFin = dias[6];

  const supabase = await createClient();
  const { data: piezas } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, estado, fecha_publicacion")
    .eq("plataforma", plataforma)
    .in("estado", ESTADOS_VIDEO)
    .gte("fecha_publicacion", semanaInicio)
    .lte("fecha_publicacion", semanaFin);

  const piezasPorFecha = new Map<
    string,
    { id: string; titulo: string; estado: string }[]
  >();
  for (const p of piezas ?? []) {
    const lista = piezasPorFecha.get(p.fecha_publicacion) ?? [];
    lista.push(p);
    piezasPorFecha.set(p.fecha_publicacion, lista);
  }

  const hoy = new Date();
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(
    hoy.getDate(),
  ).padStart(2, "0")}`;
  const semanaAnterior = addDaysISO(semanaInicio, -7);
  const semanaSiguiente = addDaysISO(semanaInicio, 7);
  const Icon = PLATAFORMA_ICON[plataforma];
  const tono = PLATAFORMA_TONO[plataforma];

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${rutaBase}?vista=semana&semana=${semanaAnterior}`}
          className="text-text-secondary"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <h2 className="text-h2 lg:text-h1">
          {formatearRangoSemana(semanaInicio, semanaFin)}
        </h2>
        <Link
          href={`${rutaBase}?vista=semana&semana=${semanaSiguiente}`}
          className="text-text-secondary"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      {dias.map((fecha, index) => {
        const piezasDia = piezasPorFecha.get(fecha) ?? [];
        const [, mesNum, diaNum] = fecha.split("-").map(Number);

        return (
          <div key={fecha} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2 px-1">
              <span className="text-h3 lg:text-h2">
                {DIA_SEMANA_LABEL[index]}
              </span>
              <span className="text-caption text-text-secondary lg:text-small">
                {diaNum} de {MES_LABEL[mesNum - 1]}
              </span>
              {fecha === hoyISO && (
                <span className="text-caption text-accent lg:text-small">
                  Hoy
                </span>
              )}
            </div>

            {piezasDia.length > 0 ? (
              <div className="flex flex-col rounded-md bg-bg-primary px-4 lg:px-5">
                {piezasDia.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 py-3 lg:gap-3.5 lg:py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm lg:h-9 lg:w-9"
                      style={{ backgroundColor: tono }}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className="text-white"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body lg:text-h3">
                      {p.titulo}
                    </span>
                    <Badge tone={ESTADO_PIEZA_TONE[p.estado]}>
                      {ESTADO_PIEZA_LABEL[p.estado]}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Link
                href={`${rutaBase}/nueva?fecha=${fecha}`}
                className="flex items-center gap-2 px-1 text-caption text-text-disabled hover:text-accent"
              >
                <Plus size={14} strokeWidth={1.5} />
                Sin vídeos — añadir uno
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
