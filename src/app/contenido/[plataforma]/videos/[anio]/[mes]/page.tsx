import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarioMensualGrid, type CeldaCalendario } from "@/components/CalendarioMensualGrid";
import { createClient } from "@/lib/supabase/server";
import { diasEnMes, isPlataforma, primerDiaSemanaMes } from "@/lib/plataformas";
import { ESTADOS_VIDEO, MES_LABEL, pad2 } from "@/lib/contenido";
import { reprogramarFecha } from "./actions";

export const dynamic = "force-dynamic";

const DIAS_CABECERA = ["L", "M", "X", "J", "V", "S", "D"];
const DIAS_RIESGO = 2;

export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ plataforma: string; anio: string; mes: string }>;
}) {
  const { plataforma, anio: anioParam, mes: mesParam } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const anio = Number(anioParam);
  const mes = Number(mesParam);
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) notFound();

  const totalDias = diasEnMes(anio, mes);
  const inicioMes = `${anio}-${pad2(mes)}-01`;
  const finMes = `${anio}-${pad2(mes)}-${pad2(totalDias)}`;

  const supabase = await createClient();

  const { data: guiones } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, estado, fecha_publicacion")
    .eq("plataforma", plataforma)
    .in("estado", ESTADOS_VIDEO)
    .gte("fecha_publicacion", inicioMes)
    .lte("fecha_publicacion", finMes)
    .order("numero");

  const porDia = new Map<number, { id: string; titulo: string; estado: string }[]>();
  for (const g of guiones ?? []) {
    const dia = Number(g.fecha_publicacion.slice(8, 10));
    const lista = porDia.get(dia) ?? [];
    lista.push({ id: g.id, titulo: g.titulo, estado: g.estado });
    porDia.set(dia, lista);
  }

  const offset = primerDiaSemanaMes(anio, mes) - 1;
  const numerosDia: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const mesAnterior = mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
  const mesSiguiente = mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };

  const hoy = new Date();
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const esHoy = (dia: number) =>
    hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes && hoy.getDate() === dia;

  function esRiesgo(dia: number, piezas: { estado: string }[]) {
    if (!piezas.some((p) => p.estado === "guion_escrito")) return false;
    const fechaDia = new Date(anio, mes - 1, dia);
    const diffDias = Math.round((fechaDia.getTime() - hoyLocal.getTime()) / 86400000);
    return diffDias <= DIAS_RIESGO;
  }

  const rutaActual = `/contenido/${plataforma}/videos/${anio}/${pad2(mes)}`;

  const celdas: (CeldaCalendario | null)[] = numerosDia.map((dia) => {
    if (dia === null) return null;
    const piezas = porDia.get(dia) ?? [];
    return {
      dia,
      fecha: `${anio}-${pad2(mes)}-${pad2(dia)}`,
      href: `${rutaActual}/${pad2(dia)}`,
      piezas,
      riesgo: esRiesgo(dia, piezas),
      esHoy: esHoy(dia),
    };
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/contenido/${plataforma}/videos/${mesAnterior.anio}/${pad2(mesAnterior.mes)}`}
          className="text-text-secondary"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-h1">
          {MES_LABEL[mes - 1]} {anio}
        </h1>
        <Link
          href={`/contenido/${plataforma}/videos/${mesSiguiente.anio}/${pad2(mesSiguiente.mes)}`}
          className="text-text-secondary"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <Link
        href={`/contenido/${plataforma}/videos/nueva`}
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover lg:px-5 lg:py-2.5"
      >
        + Nuevo vídeo
      </Link>

      <CalendarioMensualGrid
        celdas={celdas}
        diasCabecera={DIAS_CABECERA}
        reprogramarFecha={reprogramarFecha}
        redirectTo={rutaActual}
      />

      <p className="text-caption text-text-disabled">
        En rojo: guion sin grabar a {DIAS_RIESGO} días o menos de su publicación. Mantén pulsado un
        vídeo y arrástralo a otro día para reprogramarlo.
      </p>
    </div>
  );
}
