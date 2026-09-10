import Link from "next/link";
import { Check, ChevronRight, Lightbulb } from "lucide-react";
import { CalendarioPlataformas } from "@/components/CalendarioPlataformas";
import { CalendarioSemanaTransicion } from "@/components/CalendarioSemanaTransicion";
import { BarraProgresoCadencia } from "@/components/BarraProgresoCadencia";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import {
  PLATAFORMA_ICON,
  PLATAFORMA_LABEL,
  getMondayISO,
  getSundayISO,
  isPlataforma,
} from "@/lib/plataformas";
import { getIdeasOlvidadas, getProgresoCadenciaSemanal } from "@/lib/contenido";

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

  const semanaInicio = getMondayISO(new Date());
  const semanaFin = getSundayISO(semanaInicio);

  const { data: cadencia } = await supabase
    .from("cadencia_contenido")
    .select("*")
    .order("plataforma");

  const [progreso, ideasOlvidadas, { data: ideasActivasData }] =
    await Promise.all([
      getProgresoCadenciaSemanal(
        supabase,
        semanaInicio,
        semanaFin,
        (cadencia ?? []).filter((c) => c.periodo === "semana"),
      ),
      getIdeasOlvidadas(supabase, plataformasActivas),
      supabase
        .from("piezas_contenido")
        .select("plataforma")
        .eq("estado", "idea")
        .in("plataforma", plataformasActivas),
    ]);

  const progresoPorPlataforma = new Map(progreso.map((p) => [p.plataforma, p]));
  const contar = <T extends { plataforma: string }>(
    filas: T[],
    plataforma: string,
  ) => filas.filter((f) => f.plataforma === plataforma).length;

  const sinCadencia = plataformasActivas.some(
    (p) => !progresoPorPlataforma.get(p),
  );

  // Prioridad de la tarjeta (menor = antes): ideas olvidadas primero, luego
  // cadencia incompleta o sin definir, luego el resto — para que lo urgente
  // se vea sin bajar la vista, en vez del orden fijo de conexión.
  const plataformasOrdenadas = [...plataformasActivas].sort((a, b) => {
    const prioridad = (plataforma: (typeof plataformasActivas)[number]) => {
      if (contar(ideasOlvidadas, plataforma) > 0) return 0;
      const p = progresoPorPlataforma.get(plataforma);
      if (!p || p.hechas < p.cantidad) return 1;
      return 2;
    };
    return prioridad(a) - prioridad(b);
  });

  if (plataformasActivas.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
          <Lightbulb size={20} strokeWidth={1.5} className="text-accent" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-h3">Todavía no tienes ninguna plataforma activa</p>
          <p className="text-small text-text-secondary">
            Conecta o activa una para empezar a controlar tu cadencia.
          </p>
        </div>
        <Link
          href="/configuracion/plataformas"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Conectar cuentas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="inline-flex w-fit items-center gap-1 rounded-full bg-bg-primary p-1 shadow-md lg:p-1.5">
        <Link
          href="/contenido/plataformas"
          className={`text-caption rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
            enCalendario ? "text-text-secondary" : "bg-accent text-white"
          }`}
        >
          Plataformas
        </Link>
        <Link
          href={`/contenido/plataformas?vista=calendario&semana=${semanaCalendario}`}
          className={`text-caption rounded-full px-3 py-1.5 lg:px-4 lg:py-2 lg:text-body ${
            enCalendario ? "bg-accent text-white" : "text-text-secondary"
          }`}
        >
          Calendario
        </Link>
      </div>

      {enCalendario ? (
        <CalendarioSemanaTransicion semanaKey={semanaCalendario}>
          <CalendarioPlataformas
            plataformasActivas={plataformasActivas}
            semanaInicio={semanaCalendario}
          />
        </CalendarioSemanaTransicion>
      ) : (
        <>
          {sinCadencia && (
            <Link
              href="/configuracion/cadencia"
              className="flex items-center justify-between gap-3 rounded-md border border-border p-4"
            >
              <span className="text-small text-text-secondary">
                Aún no has definido tu cadencia semanal en todas tus plataformas
              </span>
              <span className="text-small shrink-0 text-accent">
                Definirla ahora →
              </span>
            </Link>
          )}

          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
            {plataformasOrdenadas.map((plataforma) => {
              const Icon = PLATAFORMA_ICON[plataforma];
              const tono = PLATAFORMA_TONO[plataforma];
              const p = progresoPorPlataforma.get(plataforma);
              const completa = p ? p.hechas >= p.cantidad : false;
              const porcentaje = p
                ? Math.min(100, (p.hechas / Math.max(1, p.cantidad)) * 100)
                : 0;
              const olvidadas = contar(ideasOlvidadas, plataforma);
              const hayIdeas = contar(ideasActivasData ?? [], plataforma) > 0;

              return (
                <section
                  key={plataforma}
                  className={`flex flex-col gap-3.5 rounded-md bg-bg-primary p-4 lg:gap-4 lg:p-5 ${
                    completa ? "border border-success" : ""
                  }`}
                >
                  <Link
                    href={`/contenido/${plataforma}/videos`}
                    className="flex items-center gap-3 lg:gap-3.5"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm lg:h-12 lg:w-12"
                      style={{ backgroundColor: tono }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        className="text-white lg:h-[22px] lg:w-[22px]"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-px">
                      <span className="flex items-center gap-1.5 text-h2">
                        {PLATAFORMA_LABEL[plataforma]}
                        {completa && (
                          <Check
                            size={16}
                            strokeWidth={2}
                            className="text-success"
                          />
                        )}
                      </span>
                      <span className="text-caption text-text-secondary truncate lg:text-small">
                        {p
                          ? `${p.hechas} de ${p.cantidad} esta semana`
                          : "Sin cadencia definida"}
                        {p?.nota ? ` · ${p.nota}` : ""}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-text-secondary"
                    />
                  </Link>

                  {p && (
                    <div className="flex items-center gap-3">
                      <BarraProgresoCadencia
                        porcentaje={porcentaje}
                        completa={completa}
                      />
                      <span className="text-caption shrink-0 text-text-secondary">
                        {Math.round(porcentaje)}%
                      </span>
                    </div>
                  )}

                  {olvidadas > 0 ? (
                    <Link
                      href={`/contenido/ideas?p=${plataforma}`}
                      className="text-caption flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{ backgroundColor: "var(--warning-bg)" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      {olvidadas}{" "}
                      {olvidadas === 1 ? "idea olvidada" : "ideas olvidadas"}
                    </Link>
                  ) : hayIdeas ? (
                    <span className="text-caption text-success flex items-center gap-1.5">
                      <Check size={14} strokeWidth={1.5} />
                      Al día
                    </span>
                  ) : (
                    <span className="text-caption text-text-disabled">
                      Sin ideas guardadas
                    </span>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
