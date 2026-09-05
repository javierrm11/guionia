import Link from "next/link";
import { ChevronRight, Video } from "lucide-react";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  getMondayISO,
  getSundayISO,
  isPlataforma,
} from "@/lib/plataformas";
import { getPiezasParaGrabarSemana } from "@/lib/contenido";

export const dynamic = "force-dynamic";

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${id}`;
}

function formatearFecha(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function ModoGrabacionPage() {
  const supabase = await createClient();

  const { data: plataformasActivasData } = await supabase
    .from("plataformas_activas")
    .select("plataforma");
  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);

  const semanaInicio = getMondayISO(new Date());
  const semanaFin = getSundayISO(semanaInicio);

  const piezas = await getPiezasParaGrabarSemana(
    supabase,
    plataformasActivas,
    semanaInicio,
    semanaFin
  );

  const porPlataforma = new Map<string, typeof piezas>();
  for (const p of piezas) {
    const lista = porPlataforma.get(p.plataforma) ?? [];
    lista.push(p);
    porPlataforma.set(p.plataforma, lista);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <p className="text-small text-text-secondary">
        {piezas.length === 0
          ? "Nada pendiente de grabar esta semana."
          : `${piezas.length} ${piezas.length === 1 ? "guion listo" : "guiones listos"} para grabar esta semana, agrupados por plataforma.`}
      </p>

      {piezas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
            <Video size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <p className="text-h3">Todo grabado por ahora</p>
          <p className="text-small text-text-secondary">
            Cuando escribas un guion con fecha esta semana, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[...porPlataforma.entries()].map(([plataforma, lista]) => {
            if (!isPlataforma(plataforma)) return null;
            const Icon = PLATAFORMA_ICON[plataforma];
            const tono = PLATAFORMA_TONO[plataforma];

            return (
              <section key={plataforma} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
                    style={{ backgroundColor: tono }}
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="text-h3">{PLATAFORMA_LABEL[plataforma]}</span>
                  <span className="text-caption text-text-disabled">{lista.length}</span>
                </div>

                <div className="flex flex-col">
                  {lista.map((p, index) => (
                    <Link
                      key={p.id}
                      href={hrefVideo(p.plataforma, p.fecha_publicacion, p.id)}
                      className={`flex items-center gap-3 py-3 hover:opacity-70 ${
                        index > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-body">{p.titulo}</span>
                      <span className="shrink-0 text-caption text-text-disabled">
                        {formatearFecha(p.fecha_publicacion)}
                      </span>
                      <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
