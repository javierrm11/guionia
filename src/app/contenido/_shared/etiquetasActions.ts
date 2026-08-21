"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarEtiquetas(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const etiquetas = formData.get("etiquetas");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Id inválido");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      etiquetas: typeof etiquetas === "string" && etiquetas.trim() ? etiquetas.trim() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
}
