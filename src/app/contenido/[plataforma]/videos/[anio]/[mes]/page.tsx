import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CalendarioMensualGrid,
  type CeldaCalendario,
} from "@/components/CalendarioMensualGrid";
import { CalendarioSemanaPlataforma } from "@/components/CalendarioSemanaPlataforma";
import { SelectorMesCalendario } from "@/components/SelectorMesCalendario";
import { createClient } from "@/lib/supabase/server";
import {
  diasEnMes,
  getMondayISO,
  isPlataforma,
  primerDiaSemanaMes,
} from "@/lib/plataformas";
import { ESTADOS_VIDEO, pad2 } from "@/lib/contenido";
import { reprogramarFecha } from "./actions";

export const dynamic = "force-dynamic";

const DIAS_CABECERA = ["L", "M", "X", "J", "V", "S", "D"];
const DIAS_RIESGO = 2;

export default async function CalendarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ plataforma: string; anio: string; mes: string }>;
  searchParams: Promise<{ vista?: string; semana?: string }>;
}) {
  const { plataforma, anio: anioParam, mes: mesParam } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const { vista, semana: semanaParam } = await searchParams;
  const enSemana = vista === "semana";

  const anio = Number(anioParam);
  const mes = Number(mesParam);
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12)
    notFound();

  const totalDias = diasEnMes(anio, mes);
  const inicioMes = `${anio}-${pad2(mes)}-01`;
  const finMes = `${anio}-${pad2(mes)}-${pad2(totalDias)}`;

  const rutaBase = `/contenido/${plataforma}/videos`;
  const rutaActual = `${rutaBase}/${anio}/${pad2(mes)}`;

  const hoy = new Date();
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes;

  const semanaCalendario =
    semanaParam && /^\d{4}-\d{2}-\d{2}$/.test(semanaParam)
      ? semanaParam
      : getMondayISO(hoy);

  if (enSemana) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
        <ControlVista rutaActual={rutaActual} enSemana />
        <CalendarioSemanaPlataforma
          plataforma={plataforma}
          semanaInicio={semanaCalendario}
          rutaBase={rutaBase}
        />
      </div>
    );
  }

  const supabase = await createClient();

  const { data: guiones } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, estado, fecha_publicacion")
    .eq("plataforma", plataforma)
    .in("estado", ESTADOS_VIDEO)
    .gte("fecha_publicacion", inicioMes)
    .lte("fecha_publicacion", finMes)
    .order("numero");

  const porDia = new Map<
    number,
    { id: string; titulo: string; estado: string }[]
  >();
  for (const g of guiones ?? []) {
    const dia = Number(g.fecha_publicacion.slice(8, 10));
    const lista = porDia.get(dia) ?? [];
    lista.push({ id: g.id, titulo: g.titulo, estado: g.estado });
    porDia.set(dia, lista);
  }

  // Días de relleno del mes anterior, solo para dar contexto de en qué día
  // de la semana cae el 1 — atenuados y sin enlace en `CalendarioMensualGrid`.
  const offset = primerDiaSemanaMes(anio, mes) - 1;
  const mesAnteriorInfo =
    mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
  const diasMesAnterior = diasEnMes(mesAnteriorInfo.anio, mesAnteriorInfo.mes);
  const celdasRelleno: CeldaCalendario[] = Array.from(
    { length: offset },
    (_, i) => {
      const dia = diasMesAnterior - offset + i + 1;
      return {
        dia,
        fecha: `${mesAnteriorInfo.anio}-${pad2(mesAnteriorInfo.mes)}-${pad2(dia)}`,
        href: "",
        piezas: [],
        riesgo: false,
        esHoy: false,
        fueraDeMes: true,
      };
    },
  );

  const mesAnterior = mesAnteriorInfo;
  const mesSiguiente =
    mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };

  const esHoy = (dia: number) =>
    hoy.getFullYear() === anio &&
    hoy.getMonth() + 1 === mes &&
    hoy.getDate() === dia;

  function esRiesgo(dia: number, piezas: { estado: string }[]) {
    if (!piezas.some((p) => p.estado === "guion_escrito")) return false;
    const fechaDia = new Date(anio, mes - 1, dia);
    const diffDias = Math.round(
      (fechaDia.getTime() - hoyLocal.getTime()) / 86400000,
    );
    return diffDias <= DIAS_RIESGO;
  }

  const celdasMes: CeldaCalendario[] = Array.from(
    { length: totalDias },
    (_, i) => {
      const dia = i + 1;
      const piezas = porDia.get(dia) ?? [];
      const fecha = `${anio}-${pad2(mes)}-${pad2(dia)}`;
      return {
        dia,
        fecha,
        // Sin nada ese día, ir directo a crear un vídeo en vez de al detalle
        // del día (que solo mostraría una lista vacía).
        href:
          piezas.length === 0
            ? `${rutaBase}/nueva?fecha=${fecha}`
            : `${rutaActual}/${pad2(dia)}`,
        piezas,
        riesgo: esRiesgo(dia, piezas),
        esHoy: esHoy(dia),
      };
    },
  );

  const celdas: (CeldaCalendario | null)[] = [...celdasRelleno, ...celdasMes];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <ControlVista rutaActual={rutaActual} enSemana={false} />

      <div className="flex items-center justify-between">
        <Link
          href={`${rutaBase}/${mesAnterior.anio}/${pad2(mesAnterior.mes)}`}
          className="text-text-secondary"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <SelectorMesCalendario base={rutaBase} anio={anio} mes={mes} />
        <Link
          href={`${rutaBase}/${mesSiguiente.anio}/${pad2(mesSiguiente.mes)}`}
          className="text-text-secondary"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <CalendarioMensualGrid
        celdas={celdas}
        diasCabecera={DIAS_CABECERA}
        reprogramarFecha={reprogramarFecha}
        redirectTo={rutaActual}
      />

      <p className="text-caption text-text-disabled">
        En rojo: guion sin grabar a {DIAS_RIESGO} días o menos de su
        publicación.
      </p>
    </div>
  );
}

/** Pestañas Mes/Semana — mismo patrón que el segmentado de `/contenido/plataformas`. */
function ControlVista({
  rutaActual,
  enSemana,
}: {
  rutaActual: string;
  enSemana: boolean;
}) {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-full bg-bg-primary p-1 shadow-md">
      <Link
        href={rutaActual}
        className={`text-caption rounded-full px-3 py-1.5 ${enSemana ? "text-text-secondary" : "bg-accent text-white"}`}
      >
        Mes
      </Link>
      <Link
        href={`${rutaActual}?vista=semana`}
        className={`text-caption rounded-full px-3 py-1.5 ${enSemana ? "bg-accent text-white" : "text-text-secondary"}`}
      >
        Semana
      </Link>
    </div>
  );
}
