"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Reprograma la fecha de publicación de una pieza — usado al soltarla en
 *  otro día del calendario mensual (`CalendarioMensualGrid`). */
export async function reprogramarFecha(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const fecha = formData.get("fecha_publicacion");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Guion inválido");
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("Fecha inválida");
  }
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase
    .from("piezas_contenido")
    .update({ fecha_publicacion: fecha })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}
