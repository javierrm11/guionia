import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import {
  ESTADOS_VIDEO,
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  MES_LABEL,
  pad2,
} from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function DiaPage({
  params,
}: {
  params: Promise<{ plataforma: string; anio: string; mes: string; dia: string }>;
}) {
  const { plataforma, anio, mes, dia } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const mesNum = Number(mes);
  const diaNum = Number(dia);
  if (!Number.isInteger(mesNum) || mesNum < 1 || mesNum > 12) notFound();
  if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 31) notFound();

  const fecha = `${anio}-${pad2(mesNum)}-${pad2(diaNum)}`;

  const supabase = await createClient();

  const { data: guiones } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("plataforma", plataforma)
    .eq("fecha_publicacion", fecha)
    .in("estado", ESTADOS_VIDEO)
    .order("numero");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-h1">
        {diaNum} de {MES_LABEL[mesNum - 1]} de {anio}
      </h1>

      <Link
        href={`/contenido/${plataforma}/videos/nueva?fecha=${fecha}`}
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nuevo vídeo
      </Link>

      {guiones && guiones.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="text-h3 px-3 py-2 text-left">#</th>
                <th className="text-h3 px-3 py-2 text-left">Título</th>
                <th className="text-h3 px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {guiones.map((guion) => (
                <tr key={guion.id} className="border-t border-border hover:bg-bg-secondary">
                  <td className="px-3 py-2 text-text-secondary">{guion.numero ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${guion.id}`}
                      className="text-accent hover:underline"
                    >
                      {guion.titulo}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={ESTADO_PIEZA_TONE[guion.estado]}>
                      {ESTADO_PIEZA_LABEL[guion.estado]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-small text-text-disabled">No hay guiones para este día.</p>
      )}
    </div>
  );
}
