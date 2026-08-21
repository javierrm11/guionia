import { Briefcase, Camera, Clapperboard, Music, type LucideIcon } from "lucide-react";

export const PLATAFORMAS = ["tiktok", "instagram", "linkedin", "youtube"] as const;
export type Plataforma = (typeof PLATAFORMAS)[number];

export function isPlataforma(value: string): value is Plataforma {
  return (PLATAFORMAS as readonly string[]).includes(value);
}

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export const PLATAFORMA_ICON: Record<Plataforma, LucideIcon> = {
  tiktok: Music,
  instagram: Camera,
  linkedin: Briefcase,
  youtube: Clapperboard,
};

export const DIA_SEMANA_LABEL = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function formatISO(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Fecha (YYYY-MM-DD) del lunes de la semana a la que pertenece `date`, en hora local. */
export function getMondayISO(date: Date) {
  const day = date.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  // Usar el constructor local (no UTC) evita que un desfase horario cambie el día.
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
  return formatISO(monday.getFullYear(), monday.getMonth() + 1, monday.getDate());
}

/** Fecha (YYYY-MM-DD) de hoy, en hora local. */
export function todayISO() {
  const now = new Date();
  return formatISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Fecha (YYYY-MM-DD) del domingo de la semana que empieza en `mondayISO`. */
export function getSundayISO(mondayISO: string) {
  const d = new Date(`${mondayISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** Suma (o resta) días a una fecha YYYY-MM-DD, sin pasar por UTC. */
export function addDaysISO(iso: string, dias: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day + dias);
  return formatISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
