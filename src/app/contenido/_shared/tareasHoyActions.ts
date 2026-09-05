"use server";

import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO, type Plataforma } from "@/lib/plataformas";
import { getPiezasParaHoy, getPlantillaDelDia, pad2 } from "@/lib/contenido";

export type TareaHoy = {
  id: string;
  titulo: string;
  plataforma: Plataforma | null;
  /** `null` = entrada de plantilla, sin pieza real todavía. */
  estado: string | null;
  href: string;
};

function hrefVideo(plataforma: string, fechaPublicacion: string, id: string) {
  const [anio, mes, dia] = fechaPublicacion.split("-");
  return `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${id}`;
}

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

  const [paraHoy, plantillaHoy] = await Promise.all([
    getPiezasParaHoy(supabase, plataformasActivas, hoy),
    getPlantillaDelDia(supabase, diaSemanaHoy),
  ]);

  return [
    ...paraHoy.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      plataforma: p.plataforma,
      estado: p.estado,
      href: hrefVideo(p.plataforma, p.fecha_publicacion, p.id),
    })),
    ...plantillaHoy.map((entrada) => ({
      id: entrada.id,
      titulo: entrada.nota,
      plataforma: entrada.plataforma,
      estado: null,
      href: entrada.plataforma
        ? `/contenido/${entrada.plataforma}/videos/nueva?fecha=${hoy}`
        : "/configuracion/plantilla",
    })),
  ];
}
