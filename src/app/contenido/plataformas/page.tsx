import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { CalendarioPlataformas } from "@/components/CalendarioPlataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  getMondayISO,
  getSundayISO,
  isPlataforma,
  todayISO,
} from "@/lib/plataformas";
import {
  getIdeasOlvidadas,
  getPendientesDePublicar,
  getPiezasEnRiesgo,
  getProgresoCadenciaSemanal,
} from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function PlataformasPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; semana?: string }>;
}) {
  const { vista, semana: semanaParam } = await searchParams;
  const enCalendario = vista === "calendario";

  const semanaCalendario =
    semanaParam && /^\d{4}-\d{2}-\d{2}$/.test(semanaParam)
      ? semanaParam
      : getMondayISO(new Date());

  const supabase = await createClient();

  const { data: plataformasActivasData } = await supabase
    .from("plataformas_activas")
    .select("plataforma");
  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);

  const hoy = todayISO();
  const semanaInicio = getMondayISO(new Date());
  const semanaFin = getSundayISO(semanaInicio);

  const { data: cadencia } = await supabase
    .from("cadencia_contenido")
    .select("*")
    .order("plataforma");

  const [progreso, pendientes, enRiesgo, ideasOlvidadas] = await Promise.all([
    getProgresoCadenciaSemanal(
      supabase,
      semanaInicio,
      semanaFin,
      (cadencia ?? []).filter((c) => c.periodo === "semana")
    ),
    getPendientesDePublicar(supabase, plataformasActivas),
    getPiezasEnRiesgo(supabase, plataformasActivas, hoy),
    getIdeasOlvidadas(supabase, plataformasActivas),
  ]);

  const progresoPorPlataforma = new Map(progreso.map((p) => [p.plataforma, p]));
  const contar = <T extends { plataforma: string }>(filas: T[], plataforma: string) =>
    filas.filter((f) => f.plataforma === plataforma).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-neutral-bg p-[0.15rem]">
        <Link
          href="/contenido/plataformas"
          className={`text-caption rounded-full px-3 py-1.5 ${
            enCalendario ? "text-text-secondary" : "bg-accent text-white"
          }`}
        >
          Plataformas
        </Link>
        <Link
          href={`/contenido/plataformas?vista=calendario&semana=${semanaCalendario}`}
          className={`text-caption rounded-full px-3 py-1.5 ${
            enCalendario ? "bg-accent text-white" : "text-text-secondary"
          }`}
        >
          Calendario
        </Link>
      </div>

      {enCalendario ? (
        <CalendarioPlataformas
          plataformasActivas={plataformasActivas}
          semanaInicio={semanaCalendario}
        />
      ) : (
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3">
      {plataformasActivas.map((plataforma) => {
        const Icon = PLATAFORMA_ICON[plataforma];
        const tono = PLATAFORMA_TONO[plataforma];
        const p = progresoPorPlataforma.get(plataforma);
        const completa = p ? p.hechas >= p.cantidad : false;
        const porcentaje = p ? Math.min(100, (p.hechas / Math.max(1, p.cantidad)) * 100) : 0;
        const riesgo = contar(enRiesgo, plataforma);
        const pendiente = contar(pendientes, plataforma);
        const olvidadas = contar(ideasOlvidadas, plataforma);

        return (
          <section
            key={plataforma}
            className="flex flex-col gap-3.5 rounded-md bg-bg-primary p-4"
          >
            <Link href={`/contenido/${plataforma}/videos`} className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
                style={{ backgroundColor: tono }}
              >
                <Icon size={20} strokeWidth={1.5} className="text-white" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="text-h2">{PLATAFORMA_LABEL[plataforma]}</span>
                <span className="text-caption text-text-secondary truncate">
                  {p ? `${p.hechas} de ${p.cantidad} esta semana` : "Sin cadencia definida"}
                  {p?.nota ? ` · ${p.nota}` : ""}
                </span>
              </span>
              <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
            </Link>

            {p ? (
              <div className="h-1.5 w-full rounded-full bg-neutral-bg">
                <div
                  className={`h-1.5 rounded-full ${completa ? "bg-success" : "bg-accent"}`}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            ) : (
              <Link
                href="/configuracion/cadencia"
                className="text-small text-accent self-start hover:underline"
              >
                Definir cadencia →
              </Link>
            )}

            {riesgo + pendiente + olvidadas > 0 ? (
              <div className="flex flex-wrap gap-2">
                {riesgo > 0 && (
                  <span
                    className="text-caption flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "var(--danger-bg)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                    {riesgo} en riesgo
                  </span>
                )}
                {pendiente > 0 && (
                  <span className="text-caption text-text-secondary rounded-full bg-neutral-bg px-2.5 py-1">
                    {pendiente} {pendiente === 1 ? "pendiente" : "pendientes"}
                  </span>
                )}
                {olvidadas > 0 && (
                  <span
                    className="text-caption text-warning rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "var(--warning-bg)" }}
                  >
                    {olvidadas} {olvidadas === 1 ? "olvidada" : "olvidadas"}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-caption text-success flex items-center gap-1.5">
                <Check size={14} strokeWidth={1.5} />
                Nada en riesgo
              </span>
            )}
          </section>
        );
      })}
      </div>
      )}
    </div>
  );
}
