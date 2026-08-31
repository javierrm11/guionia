import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  DIA_SEMANA_LABEL,
  PLATAFORMA_ICON,
  addDaysISO,
  isPlataforma,
  todayISO,
  type Plataforma,
} from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { Badge } from "@/components/Badge";
import { ESTADOS_VIDEO, ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, MES_LABEL } from "@/lib/contenido";

type Tarea = {
  id: string;
  titulo: string;
  plataforma: Plataforma | null;
  /** `null` = solo planificado en la plantilla, todavía sin pieza real. */
  estado: string | null;
};

function formatearRangoSemana(inicio: string, fin: string) {
  const [, mesInicio, diaInicio] = inicio.split("-").map(Number);
  const [, mesFin, diaFin] = fin.split("-").map(Number);
  if (mesInicio === mesFin) return `${diaInicio}–${diaFin} ${MES_LABEL[mesInicio - 1]}`;
  return `${diaInicio} ${MES_LABEL[mesInicio - 1].slice(0, 3)} – ${diaFin} ${MES_LABEL[mesFin - 1].slice(0, 3)}`;
}

export async function CalendarioPlataformas({
  plataformasActivas,
  semanaInicio,
}: {
  plataformasActivas: Plataforma[];
  semanaInicio: string;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(semanaInicio, i));
  const semanaFin = dias[6];

  const supabase = await createClient();

  const [{ data: piezas }, { data: plantilla }] =
    plataformasActivas.length > 0
      ? await Promise.all([
          supabase
            .from("piezas_contenido")
            .select("id, titulo, plataforma, estado, fecha_publicacion")
            .in("plataforma", plataformasActivas)
            .in("estado", ESTADOS_VIDEO)
            .gte("fecha_publicacion", semanaInicio)
            .lte("fecha_publicacion", semanaFin),
          supabase.from("plantilla_semanal").select("id, dia_semana, plataforma, nota"),
        ])
      : [{ data: [] }, { data: [] }];

  const piezasPorFecha = new Map<
    string,
    { id: string; titulo: string; plataforma: string; estado: string }[]
  >();
  for (const p of piezas ?? []) {
    const lista = piezasPorFecha.get(p.fecha_publicacion) ?? [];
    lista.push(p);
    piezasPorFecha.set(p.fecha_publicacion, lista);
  }

  const plantillaPorDiaSemana = new Map<
    number,
    { id: string; plataforma: Plataforma | null; nota: string }[]
  >();
  for (const entrada of plantilla ?? []) {
    const lista = plantillaPorDiaSemana.get(entrada.dia_semana) ?? [];
    lista.push({
      id: entrada.id,
      plataforma:
        typeof entrada.plataforma === "string" && isPlataforma(entrada.plataforma)
          ? entrada.plataforma
          : null,
      nota: entrada.nota,
    });
    plantillaPorDiaSemana.set(entrada.dia_semana, lista);
  }

  const hoy = todayISO();
  const semanaAnterior = addDaysISO(semanaInicio, -7);
  const semanaSiguiente = addDaysISO(semanaInicio, 7);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/contenido/plataformas?vista=calendario&semana=${semanaAnterior}`}
          className="text-text-secondary"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <h2 className="text-h2">{formatearRangoSemana(semanaInicio, semanaFin)}</h2>
        <Link
          href={`/contenido/plataformas?vista=calendario&semana=${semanaSiguiente}`}
          className="text-text-secondary"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      {dias.map((fecha, index) => {
        const diaSemana = index + 1;
        const piezasDia = piezasPorFecha.get(fecha) ?? [];
        const plataformasReales = new Set(piezasDia.map((p) => p.plataforma));
        const plantillaDia = (plantillaPorDiaSemana.get(diaSemana) ?? []).filter(
          (e) => !e.plataforma || !plataformasReales.has(e.plataforma)
        );

        const tareas: Tarea[] = [
          ...piezasDia.map((p) => ({
            id: p.id,
            titulo: p.titulo,
            plataforma: p.plataforma as Plataforma,
            estado: p.estado as string | null,
          })),
          ...plantillaDia.map((e) => ({
            id: e.id,
            titulo: e.nota,
            plataforma: e.plataforma,
            estado: null,
          })),
        ];

        const [, mesNum, diaNum] = fecha.split("-").map(Number);

        return (
          <div key={fecha} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2 px-1">
              <span className="text-h3">{DIA_SEMANA_LABEL[index]}</span>
              <span className="text-caption text-text-secondary">
                {diaNum} de {MES_LABEL[mesNum - 1]}
              </span>
              {fecha === hoy && <span className="text-caption text-accent">Hoy</span>}
            </div>

            {tareas.length > 0 ? (
              <div className="flex flex-col rounded-md bg-bg-primary px-4">
                {tareas.map((t, i) => {
                  const Icon = t.plataforma ? PLATAFORMA_ICON[t.plataforma] : Plus;
                  const tono = t.plataforma ? PLATAFORMA_TONO[t.plataforma] : "var(--neutral)";
                  const pendiente = t.estado === null;

                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-border " : ""}${
                        pendiente ? "opacity-70" : ""
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
                        style={{ backgroundColor: tono }}
                      >
                        <Icon size={16} strokeWidth={1.5} className="text-white" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body">{t.titulo}</span>
                      {t.estado ? (
                        <Badge tone={ESTADO_PIEZA_TONE[t.estado]}>
                          {ESTADO_PIEZA_LABEL[t.estado]}
                        </Badge>
                      ) : (
                        <span className="text-caption text-text-secondary shrink-0 rounded-full bg-neutral-bg px-2.5 py-1">
                          Plantilla
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-1 text-caption text-text-disabled">Sin tareas</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
