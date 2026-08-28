import type { SupabaseClient } from "@supabase/supabase-js";
import type { BadgeTone } from "@/components/Badge";
import { addDaysISO, todayISO, type Plataforma } from "@/lib/plataformas";

export const RANGOS_ESTADISTICAS = ["siempre", "hoy", "semana", "mes", "anio"] as const;
export type RangoEstadisticas = (typeof RANGOS_ESTADISTICAS)[number];

export function isRangoEstadisticas(value: string | undefined): value is RangoEstadisticas {
  return !!value && (RANGOS_ESTADISTICAS as readonly string[]).includes(value);
}

export const RANGO_ESTADISTICAS_LABEL: Record<RangoEstadisticas, string> = {
  siempre: "Desde siempre",
  hoy: "Últimas 24 horas",
  semana: "Última semana",
  mes: "Último mes",
  anio: "Último año",
};

export type LimitesRango = {
  actualDesde: string;
  actualHasta: string;
  /** `null` en "siempre" — no hay periodo anterior con el que comparar. */
  anteriorDesde: string | null;
  anteriorHasta: string | null;
};

/**
 * Límites de fecha para un rango de estadísticas, en ventanas móviles (no
 * mes/año natural) — "últimas 24 horas" es en realidad hoy vs. ayer, porque
 * las APIs de analítica (YouTube) no dan más resolución que por día.
 */
export function calcularLimitesRango(rango: RangoEstadisticas): LimitesRango {
  const hoy = todayISO();

  switch (rango) {
    case "hoy":
      return {
        actualDesde: hoy,
        actualHasta: hoy,
        anteriorDesde: addDaysISO(hoy, -1),
        anteriorHasta: addDaysISO(hoy, -1),
      };
    case "semana":
      return {
        actualDesde: addDaysISO(hoy, -6),
        actualHasta: hoy,
        anteriorDesde: addDaysISO(hoy, -13),
        anteriorHasta: addDaysISO(hoy, -7),
      };
    case "mes":
      return {
        actualDesde: addDaysISO(hoy, -29),
        actualHasta: hoy,
        anteriorDesde: addDaysISO(hoy, -59),
        anteriorHasta: addDaysISO(hoy, -30),
      };
    case "anio":
      return {
        actualDesde: addDaysISO(hoy, -364),
        actualHasta: hoy,
        anteriorDesde: addDaysISO(hoy, -729),
        anteriorHasta: addDaysISO(hoy, -365),
      };
    case "siempre":
      return { actualDesde: "2005-02-01", actualHasta: hoy, anteriorDesde: null, anteriorHasta: null };
  }
}

export const PILAR_LABEL: Record<string, string> = {
  educativo: "Educativo",
  build_in_public: "Build in public",
  producto_en_accion: "Producto en acción",
  opinion: "Opinión",
};

export const TIPOS_ESCENA = ["hook", "desarrollo", "cta"] as const;
export type TipoEscena = (typeof TIPOS_ESCENA)[number];

export const TIPO_ESCENA_LABEL: Record<TipoEscena, string> = {
  hook: "Hook",
  desarrollo: "Desarrollo",
  cta: "CTA",
};

export const ESTADO_PIEZA_LABEL: Record<string, string> = {
  idea: "Idea",
  descartada: "Descartada",
  guion_escrito: "Guion escrito",
  grabado: "Grabado",
  editado: "Editado",
  publicado: "Publicado",
};

export const ESTADO_PIEZA_TONE: Record<string, BadgeTone> = {
  idea: "neutral",
  descartada: "danger",
  guion_escrito: "warning",
  grabado: "warning",
  editado: "warning",
  publicado: "success",
};

export const MES_LABEL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Marca `plataforma` como activa al conectarla por OAuth (YouTube/TikTok) —
 * conectar = activar, ya no hay un paso manual aparte en Configuración.
 * Devuelve si era la primera plataforma activa de la cuenta, para decidir si
 * toca mandar a `/contenido/bienvenida` (la pregunta de cadencia/plantilla).
 */
export async function activarPlataformaConectada(
  supabase: SupabaseClient,
  plataforma: Plataforma
): Promise<{ eraPrimera: boolean }> {
  const { data: actuales } = await supabase.from("plataformas_activas").select("plataforma");
  const eraPrimera = (actuales ?? []).length === 0;

  if (!(actuales ?? []).some((r) => r.plataforma === plataforma)) {
    await supabase.from("plataformas_activas").insert({ plataforma });
  }

  return { eraPrimera };
}

/** Al desconectar una cuenta, se desactiva también la plataforma correspondiente. */
export async function desactivarPlataforma(supabase: SupabaseClient, plataforma: Plataforma) {
  await supabase.from("plataformas_activas").delete().eq("plataforma", plataforma);
}

/** Estados que todavía viven en el banco de ideas (sin fecha, sección "Ideas"). */
export const ESTADOS_IDEA = ["idea", "descartada"] as const;

/** Estados que ya pasaron a producción (sección "Vídeos", con fecha). */
export const ESTADOS_VIDEO = ["guion_escrito", "grabado", "editado", "publicado"] as const;

/** Siguiente paso del pipeline guion_escrito → grabado → editado → publicado, o null si ya está publicado. */
export function getSiguienteEstadoVideo(
  estado: string
): (typeof ESTADOS_VIDEO)[number] | null {
  const index = ESTADOS_VIDEO.indexOf(estado as (typeof ESTADOS_VIDEO)[number]);
  if (index === -1 || index === ESTADOS_VIDEO.length - 1) return null;
  return ESTADOS_VIDEO[index + 1];
}

type CadenciaSemanalRow = {
  id: string;
  plataforma: Plataforma;
  cantidad: number;
  nota: string | null;
};

export type ProgresoCadencia = {
  id: string;
  plataforma: Plataforma;
  cantidad: number;
  hechas: number;
  nota: string | null;
};

/**
 * Progreso real de cada cadencia semanal: cuántas piezas ya están
 * `publicado` con `fecha_publicacion` dentro de la semana [semanaInicio, semanaFin],
 * frente a la cantidad objetivo. Se calcula al vuelo, sin checklist manual.
 */
export async function getProgresoCadenciaSemanal(
  supabase: SupabaseClient,
  semanaInicio: string,
  semanaFin: string,
  cadenciaSemanal: CadenciaSemanalRow[]
): Promise<ProgresoCadencia[]> {
  return Promise.all(
    cadenciaSemanal.map(async (c) => {
      const { count } = await supabase
        .from("piezas_contenido")
        .select("id", { count: "exact", head: true })
        .eq("plataforma", c.plataforma)
        .eq("estado", "publicado")
        .gte("fecha_publicacion", semanaInicio)
        .lte("fecha_publicacion", semanaFin);

      return {
        id: c.id,
        plataforma: c.plataforma,
        cantidad: c.cantidad,
        hechas: count ?? 0,
        nota: c.nota,
      };
    })
  );
}

/**
 * Semanas consecutivas (hacia atrás desde la semana anterior a la actual,
 * que puede estar todavía en curso) cumpliendo el objetivo semanal total.
 * Una sola consulta trayendo las fechas del rango completo y agrupando en
 * memoria, en vez de una consulta por semana.
 */
export async function getRachaSemanas(
  supabase: SupabaseClient,
  cadenciaSemanal: CadenciaSemanalRow[],
  semanaActualInicio: string,
  maxSemanas = 12
): Promise<number> {
  const objetivoTotal = cadenciaSemanal.reduce((suma, c) => suma + c.cantidad, 0);
  if (objetivoTotal === 0) return 0;

  const plataformas = [...new Set(cadenciaSemanal.map((c) => c.plataforma))];
  const inicioRango = addDaysISO(semanaActualInicio, -7 * maxSemanas);
  const finRango = addDaysISO(semanaActualInicio, -1);

  const { data } = await supabase
    .from("piezas_contenido")
    .select("fecha_publicacion")
    .in("plataforma", plataformas)
    .eq("estado", "publicado")
    .gte("fecha_publicacion", inicioRango)
    .lte("fecha_publicacion", finRango);

  const fechas = (data ?? []).map((r) => r.fecha_publicacion as string);

  let racha = 0;
  let inicioSemana = addDaysISO(semanaActualInicio, -7);
  for (let i = 0; i < maxSemanas; i++) {
    const finSemana = addDaysISO(inicioSemana, 6);
    const hechas = fechas.filter((f) => f >= inicioSemana && f <= finSemana).length;
    if (hechas < objetivoTotal) break;
    racha += 1;
    inicioSemana = addDaysISO(inicioSemana, -7);
  }

  return racha;
}

export type PiezaPendiente = {
  id: string;
  titulo: string;
  plataforma: Plataforma;
  estado: string;
  fecha_publicacion: string;
};

/**
 * Piezas ya grabadas o editadas (pero no publicadas todavía) de las
 * plataformas activas, ordenadas por fecha de publicación más próxima.
 */
export async function getPendientesDePublicar(
  supabase: SupabaseClient,
  plataformas: Plataforma[]
): Promise<PiezaPendiente[]> {
  if (plataformas.length === 0) return [];

  const { data } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, plataforma, estado, fecha_publicacion")
    .in("plataforma", plataformas)
    .in("estado", ["grabado", "editado"])
    .order("fecha_publicacion", { ascending: true });

  return data ?? [];
}

/** Etiquetas más usadas en todas las piezas, de más a menos frecuente. */
export async function getEtiquetasPopulares(
  supabase: SupabaseClient,
  limite = 12
): Promise<string[]> {
  const { data } = await supabase
    .from("piezas_contenido")
    .select("etiquetas")
    .not("etiquetas", "is", null);

  const conteo = new Map<string, number>();
  for (const row of data ?? []) {
    for (const cruda of (row.etiquetas ?? "").split(",")) {
      const etiqueta = cruda.trim();
      if (!etiqueta) continue;
      conteo.set(etiqueta, (conteo.get(etiqueta) ?? 0) + 1);
    }
  }

  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([etiqueta]) => etiqueta);
}

export type IdeaReciente = {
  id: string;
  titulo: string;
  plataforma: Plataforma;
};

/** Las últimas ideas guardadas (sin descartar) — para no perderlas de vista en el dashboard. */
export async function getUltimasIdeas(
  supabase: SupabaseClient,
  plataformas: Plataforma[],
  limite = 4
): Promise<IdeaReciente[]> {
  if (plataformas.length === 0) return [];

  const { data } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, plataforma")
    .in("plataforma", plataformas)
    .eq("estado", "idea")
    .order("created_at", { ascending: false })
    .limit(limite);

  return data ?? [];
}

export type PiezaRiesgo = {
  id: string;
  titulo: string;
  plataforma: Plataforma;
  fecha_publicacion: string;
};

/**
 * Piezas con guion escrito pero sin grabar, con fecha de publicación hoy o
 * dentro de `diasRiesgo` días (incluye las ya vencidas). Base de la vista "Hoy".
 */
export async function getPiezasEnRiesgo(
  supabase: SupabaseClient,
  plataformas: Plataforma[],
  hoyISO: string,
  diasRiesgo = 2
): Promise<PiezaRiesgo[]> {
  if (plataformas.length === 0) return [];

  const limite = addDaysISO(hoyISO, diasRiesgo);

  const { data } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, plataforma, fecha_publicacion")
    .in("plataforma", plataformas)
    .eq("estado", "guion_escrito")
    .not("fecha_publicacion", "is", null)
    .lte("fecha_publicacion", limite)
    .order("fecha_publicacion", { ascending: true });

  return data ?? [];
}

export type PiezaHoy = {
  id: string;
  titulo: string;
  plataforma: Plataforma;
  estado: string;
  fecha_publicacion: string;
};

/**
 * Piezas con fecha de publicación hoy que todavía no están publicadas —
 * cualquier estado del pipeline (guion escrito, grabado o editado), no solo
 * "pendiente de grabar" como `getPiezasEnRiesgo`. Es la cola real del día.
 */
export async function getPiezasParaHoy(
  supabase: SupabaseClient,
  plataformas: Plataforma[],
  hoyISO: string
): Promise<PiezaHoy[]> {
  if (plataformas.length === 0) return [];

  const { data } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, plataforma, estado, fecha_publicacion")
    .in("plataforma", plataformas)
    .in("estado", ["guion_escrito", "grabado", "editado"])
    .eq("fecha_publicacion", hoyISO)
    .order("plataforma");

  return data ?? [];
}

export type EntradaPlantilla = {
  id: string;
  plataforma: Plataforma | null;
  nota: string;
};

/** Entradas de la plantilla semanal (referencia manual) para un día de la semana (1 = lunes ... 7 = domingo). */
export async function getPlantillaDelDia(
  supabase: SupabaseClient,
  diaSemana: number
): Promise<EntradaPlantilla[]> {
  const { data } = await supabase
    .from("plantilla_semanal")
    .select("id, plataforma, nota")
    .eq("dia_semana", diaSemana);

  return data ?? [];
}

export type IdeaOlvidada = {
  id: string;
  titulo: string;
  plataforma: Plataforma;
  created_at: string;
};

/** Ideas (sin convertir en guion) creadas hace más de `diasUmbral` días. */
export async function getIdeasOlvidadas(
  supabase: SupabaseClient,
  plataformas: Plataforma[],
  diasUmbral = 30
): Promise<IdeaOlvidada[]> {
  if (plataformas.length === 0) return [];

  const limite = new Date();
  limite.setDate(limite.getDate() - diasUmbral);

  const { data } = await supabase
    .from("piezas_contenido")
    .select("id, titulo, plataforma, created_at")
    .in("plataforma", plataformas)
    .eq("estado", "idea")
    .lt("created_at", limite.toISOString())
    .order("created_at", { ascending: true });

  return data ?? [];
}
