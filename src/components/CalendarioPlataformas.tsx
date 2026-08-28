import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  diasEnMes,
  isPlataforma,
  primerDiaSemanaMes,
  type Plataforma,
} from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { ESTADOS_VIDEO, MES_LABEL, pad2 } from "@/lib/contenido";

const DIAS_CABECERA = ["L", "M", "X", "J", "V", "S", "D"];

/** Día de la semana (1 = lunes ... 7 = domingo) de una fecha concreta del mes. */
function diaSemanaDe(anio: number, mes: number, dia: number) {
  const jsDay = new Date(anio, mes - 1, dia).getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export async function CalendarioPlataformas({
  plataformasActivas,
  anio,
  mes,
}: {
  plataformasActivas: Plataforma[];
  anio: number;
  mes: number;
}) {
  const totalDias = diasEnMes(anio, mes);
  const inicioMes = `${anio}-${pad2(mes)}-01`;
  const finMes = `${anio}-${pad2(mes)}-${pad2(totalDias)}`;

  const supabase = await createClient();

  const [{ data: piezas }, { data: plantilla }] =
    plataformasActivas.length > 0
      ? await Promise.all([
          supabase
            .from("piezas_contenido")
            .select("plataforma, estado, fecha_publicacion")
            .in("plataforma", plataformasActivas)
            .in("estado", ESTADOS_VIDEO)
            .gte("fecha_publicacion", inicioMes)
            .lte("fecha_publicacion", finMes),
          supabase.from("plantilla_semanal").select("dia_semana, plataforma"),
        ])
      : [{ data: [] }, { data: [] }];

  const porDia = new Map<number, { plataforma: string; estado: string }[]>();
  for (const p of piezas ?? []) {
    const dia = Number(p.fecha_publicacion.slice(8, 10));
    const lista = porDia.get(dia) ?? [];
    lista.push({ plataforma: p.plataforma, estado: p.estado });
    porDia.set(dia, lista);
  }

  const plantillaPorDiaSemana = new Map<number, Plataforma[]>();
  for (const entrada of plantilla ?? []) {
    if (typeof entrada.plataforma !== "string" || !isPlataforma(entrada.plataforma)) continue;
    const lista = plantillaPorDiaSemana.get(entrada.dia_semana) ?? [];
    lista.push(entrada.plataforma);
    plantillaPorDiaSemana.set(entrada.dia_semana, lista);
  }

  const offset = primerDiaSemanaMes(anio, mes) - 1;
  const celdas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const mesAnterior = mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
  const mesSiguiente = mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };

  const hoy = new Date();
  const esHoy = (dia: number) =>
    hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes && hoy.getDate() === dia;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/contenido/plataformas?vista=calendario&anio=${mesAnterior.anio}&mes=${pad2(mesAnterior.mes)}`}
          className="text-text-secondary"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <h2 className="text-h2">
          {MES_LABEL[mes - 1]} {anio}
        </h2>
        <Link
          href={`/contenido/plataformas?vista=calendario&anio=${mesSiguiente.anio}&mes=${pad2(mesSiguiente.mes)}`}
          className="text-text-secondary"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_CABECERA.map((d) => (
          <div key={d} className="text-caption text-center text-text-secondary">
            {d}
          </div>
        ))}

        {celdas.map((dia, index) => {
          if (dia === null) return <div key={`vacio-${index}`} />;

          const piezasDia = porDia.get(dia) ?? [];
          const plataformasReales = [...new Set(piezasDia.map((p) => p.plataforma))];
          const plataformasPlan = [
            ...new Set(plantillaPorDiaSemana.get(diaSemanaDe(anio, mes, dia)) ?? []),
          ];
          const plataformasSoloPlan = plataformasPlan.filter(
            (p) => !plataformasReales.includes(p)
          );

          const cumplido =
            plataformasPlan.length > 0
              ? plataformasPlan.every((p) =>
                  piezasDia.some((pieza) => pieza.plataforma === p && pieza.estado === "publicado")
                )
              : piezasDia.length > 0 && piezasDia.every((p) => p.estado === "publicado");

          return (
            <div
              key={dia}
              className={`relative flex min-h-14 flex-col items-center gap-1 rounded-sm border p-1 lg:min-h-20 ${
                esHoy(dia) ? "border-accent bg-accent-bg" : "border-border"
              }`}
            >
              <span className="text-caption text-text-secondary">{dia}</span>

              {(plataformasReales.length > 0 || plataformasSoloPlan.length > 0) && (
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {plataformasReales.map((p) => (
                    <span
                      key={`real-${p}`}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: PLATAFORMA_TONO[p as Plataforma] }}
                    />
                  ))}
                  {plataformasSoloPlan.map((p) => (
                    <span
                      key={`plan-${p}`}
                      className="h-1.5 w-1.5 rounded-full border"
                      style={{ borderColor: PLATAFORMA_TONO[p] }}
                    />
                  ))}
                </div>
              )}

              {cumplido && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success">
                  <Check size={10} strokeWidth={3} className="text-white" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-caption text-text-disabled">
        Punto relleno: contenido real ese día. Punto hueco: plataforma planificada en tu plantilla
        semanal para ese día pero sin publicar todavía. Tick verde: se cumplió el plan de ese día.
      </p>
    </div>
  );
}
