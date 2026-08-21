"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarSerie(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const serie = formData.get("serie");
  const serieParte = formData.get("serie_parte");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Id inválido");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const parteNum = Number(serieParte);

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      serie: typeof serie === "string" && serie.trim() ? serie.trim() : null,
      serie_parte: Number.isInteger(parteNum) && parteNum > 0 ? parteNum : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
}
