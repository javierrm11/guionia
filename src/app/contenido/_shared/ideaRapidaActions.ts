"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

export async function crearIdeaRapida(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const titulo = formData.get("titulo");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof titulo !== "string" || titulo.trim().length === 0) {
    throw new Error("El título es obligatorio");
  }

  const { error } = await supabase.from("piezas_contenido").insert({
    plataforma,
    titulo: titulo.trim(),
    estado: "idea",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contenido");
}
