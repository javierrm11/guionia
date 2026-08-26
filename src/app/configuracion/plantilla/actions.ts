"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

function revalidarPlantilla() {
  revalidatePath("/configuracion/plantilla");
  revalidatePath("/contenido");
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

  revalidarPlantilla();
  redirect("/configuracion/plantilla");
}

export async function eliminarPlantilla(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("plantilla_semanal").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidarPlantilla();
}
