"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { TIPOS_ESCENA } from "@/lib/contenido";

export async function crearEstructura(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const nombre = formData.get("nombre");
  const duracionSegundos = formData.get("duracion_segundos");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof nombre !== "string" || nombre.trim().length === 0) {
    throw new Error("El nombre es obligatorio");
  }
  const duracionNum = Number(duracionSegundos);
  if (!Number.isInteger(duracionNum) || duracionNum < 1) {
    throw new Error("La duración debe ser un número entero positivo");
  }

  const { data, error } = await supabase
    .from("estructuras_guion")
    .insert({ plataforma, nombre: nombre.trim(), duracion_segundos: duracionNum })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la estructura");
  }

  revalidatePath("/configuracion/estructuras");
  redirect(`/configuracion/estructuras/${data.id}`);
}

export async function duplicarEstructura(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { data: original } = await supabase
    .from("estructuras_guion")
    .select("*, estructura_escenas(*)")
    .eq("id", id)
    .maybeSingle();

  if (!original) throw new Error("Estructura no encontrada");

  const { data: copia, error } = await supabase
    .from("estructuras_guion")
    .insert({
      plataforma: original.plataforma,
      nombre: `${original.nombre} (copia)`,
      duracion_segundos: original.duracion_segundos,
    })
    .select("id")
    .single();

  if (error || !copia) {
    throw new Error(error?.message ?? "No se pudo duplicar la estructura");
  }

  const escenas = original.estructura_escenas ?? [];
  if (escenas.length > 0) {
    const { error: escenasError } = await supabase.from("estructura_escenas").insert(
      escenas.map((e: { orden: number; tipo_escena: string; duracion_segundos: number; nota: string | null }) => ({
        estructura_id: copia.id,
        orden: e.orden,
        tipo_escena: e.tipo_escena,
        duracion_segundos: e.duracion_segundos,
        nota: e.nota,
      }))
    );

    if (escenasError) throw new Error(escenasError.message);
  }

  revalidatePath("/configuracion/estructuras");
  redirect(`/configuracion/estructuras/${copia.id}`);
}

export async function eliminarEstructura(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("estructuras_guion").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/configuracion/estructuras");
  redirect("/configuracion/estructuras");
}

export async function agregarEscenaEstructura(formData: FormData) {
  const supabase = await createClient();

  const estructuraId = formData.get("estructura_id");
  const tipoEscena = formData.get("tipo_escena");
  const duracionSegundos = formData.get("duracion_segundos");
  const nota = formData.get("nota");

  if (typeof estructuraId !== "string" || !estructuraId) {
    throw new Error("Estructura inválida");
  }
  if (
    typeof tipoEscena !== "string" ||
    !(TIPOS_ESCENA as readonly string[]).includes(tipoEscena)
  ) {
    throw new Error("Tipo de escena inválido");
  }
  const duracionNum = Number(duracionSegundos);
  if (!Number.isInteger(duracionNum) || duracionNum < 1) {
    throw new Error("La duración debe ser un número entero positivo");
  }

  const { data: ultima } = await supabase
    .from("estructura_escenas")
    .select("orden")
    .eq("estructura_id", estructuraId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("estructura_escenas").insert({
    estructura_id: estructuraId,
    orden: (ultima?.orden ?? 0) + 1,
    tipo_escena: tipoEscena,
    duracion_segundos: duracionNum,
    nota: typeof nota === "string" && nota.trim() ? nota.trim() : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/configuracion/estructuras/${estructuraId}`);
}

export async function eliminarEscenaEstructura(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const estructuraId = formData.get("estructura_id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("estructura_escenas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (typeof estructuraId === "string" && estructuraId) {
    revalidatePath(`/configuracion/estructuras/${estructuraId}`);
  }
}

export async function moverEscenaEstructura(formData: FormData) {
  const supabase = await createClient();

  const estructuraId = formData.get("estructura_id");
  const id = formData.get("id");
  const direccion = formData.get("direccion");

  if (typeof estructuraId !== "string" || !estructuraId) {
    throw new Error("Estructura inválida");
  }
  if (direccion !== "arriba" && direccion !== "abajo") {
    throw new Error("Dirección inválida");
  }

  const { data: escenas } = await supabase
    .from("estructura_escenas")
    .select("id, orden")
    .eq("estructura_id", estructuraId)
    .order("orden", { ascending: true });

  if (!escenas) return;

  const index = escenas.findIndex((e) => e.id === id);
  const vecinoIndex = direccion === "arriba" ? index - 1 : index + 1;
  if (index === -1 || vecinoIndex < 0 || vecinoIndex >= escenas.length) return;

  const actual = escenas[index];
  const vecino = escenas[vecinoIndex];

  await Promise.all([
    supabase.from("estructura_escenas").update({ orden: vecino.orden }).eq("id", actual.id),
    supabase.from("estructura_escenas").update({ orden: actual.orden }).eq("id", vecino.id),
  ]);

  revalidatePath(`/configuracion/estructuras/${estructuraId}`);
}
