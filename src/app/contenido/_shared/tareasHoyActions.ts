"use server";

import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO } from "@/lib/plataformas";
import { getTareasHoy, type TareaHoy } from "@/lib/contenido";

/** Mismas tareas de hoy que muestra la tarjeta "hero" de Control — llamada
 *  directamente (sin `<form>`) desde `PanelHoy.tsx`, el panel fijo de
 *  escritorio, para no tener que duplicar la consulta en cada navegación. */
export async function obtenerTareasHoy(): Promise<TareaHoy[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: plataformasActivasData } = await supabase
    .from("plataformas_activas")
    .select("plataforma");
  const plataformasActivas = (plataformasActivasData ?? [])
    .map((r) => r.plataforma)
    .filter(isPlataforma);
  if (plataformasActivas.length === 0) return [];

  const hoy = todayISO();
  const diaSemanaHoy = ((new Date().getDay() + 6) % 7) + 1; // 1 = lunes ... 7 = domingo

  return getTareasHoy(supabase, plataformasActivas, hoy, diaSemanaHoy);
}
