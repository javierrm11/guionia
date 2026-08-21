import type { SupabaseClient } from "@supabase/supabase-js";
import type { BadgeTone } from "@/components/Badge";
import { addDaysISO, type Plataforma } from "@/lib/plataformas";

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
