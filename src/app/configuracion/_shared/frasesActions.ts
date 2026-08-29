"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { TIPOS_ESCENA } from "@/lib/contenido";

export async function crearFrase(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const tipoEscena = formData.get("tipo_escena");
  const texto = formData.get("texto");
  const nota = formData.get("nota");
  const redirectTo = formData.get("redirectTo");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (
    typeof tipoEscena !== "string" ||
    !(TIPOS_ESCENA as readonly string[]).includes(tipoEscena)
  ) {
    throw new Error("Tipo de escena inválido");
  }
  if (typeof texto !== "string" || texto.trim().length === 0) {
    throw new Error("El texto es obligatorio");
  }
  if (typeof redirectTo !== "string" || !redirectTo) {
    throw new Error("Ruta de destino inválida");
  }

  const { error } = await supabase.from("frases_guardadas").insert({
    plataforma,
    tipo_escena: tipoEscena,
    texto: texto.trim(),
    nota: typeof nota === "string" && nota.trim() ? nota.trim() : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

/** Borrado suave — la frase pasa a la papelera (`/configuracion/papelera`)
 *  en vez de desaparecer para siempre. */
export async function eliminarFrase(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Id inválido");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase
    .from("frases_guardadas")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
}
