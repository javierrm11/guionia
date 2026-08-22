import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { ESTADOS_VIDEO, MES_LABEL, pad2 } from "@/lib/contenido";

export const dynamic = "force-dynamic";

const DIAS_CABECERA = ["L", "M", "X", "J", "V", "S", "D"];
const DIAS_RIESGO = 2;

function diasEnMes(anio: number, mes: number) {
  return new Date(anio, mes, 0).getDate();
}

/** Día de la semana del día 1 del mes: 1 = lunes ... 7 = domingo. */
function primerDiaSemana(anio: number, mes: number) {
  const jsDay = new Date(anio, mes - 1, 1).getDay(); // 0 = domingo
  return jsDay === 0 ? 7 : jsDay;
}

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

  const porDia = new Map<number, { titulo: string; estado: string }[]>();
  for (const g of guiones ?? []) {
    const dia = Number(g.fecha_publicacion.slice(8, 10));
    const lista = porDia.get(dia) ?? [];
    lista.push({ titulo: g.titulo, estado: g.estado });
    porDia.set(dia, lista);
  }

  const offset = primerDiaSemana(anio, mes) - 1;
  const celdas: (number | null)[] = [
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
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nuevo vídeo
      </Link>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_CABECERA.map((d) => (
          <div key={d} className="text-caption text-center text-text-secondary">
            {d}
          </div>
        ))}

        {celdas.map((dia, index) => {
          if (dia === null) return <div key={`vacio-${index}`} />;

          const piezas = porDia.get(dia) ?? [];
          const visibles = piezas.slice(0, 2);
          const restantes = piezas.length - visibles.length;
          const riesgo = esRiesgo(dia, piezas);

          const colorBorde = riesgo
            ? "border-danger bg-danger-bg"
            : esHoy(dia)
              ? "border-accent bg-accent-bg"
              : "border-border";

          return (
            <Link
              key={dia}
              href={`/contenido/${plataforma}/videos/${anio}/${pad2(mes)}/${pad2(dia)}`}
              className={`flex min-h-16 flex-col gap-0.5 rounded-sm border p-1 hover:bg-bg-secondary lg:min-h-24 lg:p-2 ${colorBorde}`}
            >
              <span
                className={`text-caption ${riesgo ? "text-danger" : "text-text-secondary"}`}
              >
                {dia}
              </span>
              {visibles.map((p, i) => (
                <span key={i} className="truncate text-caption text-accent" title={p.titulo}>
                  {p.titulo}
                </span>
              ))}
              {restantes > 0 && (
                <span className="text-caption text-text-disabled">+{restantes} más</span>
              )}
            </Link>
          );
        })}
      </div>

      <p className="text-caption text-text-disabled">
        En rojo: guion sin grabar a {DIAS_RIESGO} días o menos de su publicación.
      </p>
    </div>
  );
}
