"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

function revalidarControlSemanal() {
  revalidatePath("/configuracion/control-semanal");
  revalidatePath("/contenido");
}

export async function crearCadencia(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const cantidad = formData.get("cantidad");
  const periodo = formData.get("periodo");
  const nota = formData.get("nota");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  const cantidadNum = Number(cantidad);
  if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
    throw new Error("La cantidad debe ser un número entero positivo");
  }
  if (periodo !== "semana" && periodo !== "mes") {
    throw new Error("Periodo inválido");
  }

  const { error } = await supabase.from("cadencia_contenido").insert({
    plataforma,
    cantidad: cantidadNum,
    periodo,
    nota: typeof nota === "string" && nota.trim() ? nota.trim() : null,
  });

  if (error) throw new Error(error.message);

  revalidarControlSemanal();
  redirect("/configuracion/control-semanal");
}

export async function eliminarCadencia(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("cadencia_contenido").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidarControlSemanal();
}

export async function crearPlantilla(formData: FormData) {
  const supabase = await createClient();

  const diaSemana = formData.get("dia_semana");
  const plataforma = formData.get("plataforma");
  const nota = formData.get("nota");

  const diaNum = Number(diaSemana);
  if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 7) {
    throw new Error("Día de la semana inválido");
  }
  if (typeof nota !== "string" || nota.trim().length === 0) {
    throw new Error("La nota es obligatoria");
  }
  if (typeof plataforma === "string" && plataforma && !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }

  const { error } = await supabase.from("plantilla_semanal").insert({
    dia_semana: diaNum,
    plataforma: typeof plataforma === "string" && plataforma ? plataforma : null,
    nota: nota.trim(),
  });

  if (error) throw new Error(error.message);

  revalidarControlSemanal();
  redirect("/configuracion/control-semanal");
}

export async function eliminarPlantilla(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("plantilla_semanal").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidarControlSemanal();
}
