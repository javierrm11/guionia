"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

function revalidarCadencia() {
  revalidatePath("/configuracion/cadencia");
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

  revalidarCadencia();
  redirect("/configuracion/cadencia");
}

export async function eliminarCadencia(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("cadencia_contenido").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidarCadencia();
}
