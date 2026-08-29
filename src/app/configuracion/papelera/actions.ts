"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const RUTA = "/configuracion/papelera";

export async function restaurarEscena(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Escena inválida");

  const { error } = await supabase
    .from("escenas_guion")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(RUTA);
}

export async function eliminarEscenaDefinitivo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Escena inválida");

  const { error } = await supabase.from("escenas_guion").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(RUTA);
}

export async function restaurarFrase(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase
    .from("frases_guardadas")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(RUTA);
}

export async function eliminarFraseDefinitivo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Id inválido");

  const { error } = await supabase.from("frases_guardadas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(RUTA);
}
