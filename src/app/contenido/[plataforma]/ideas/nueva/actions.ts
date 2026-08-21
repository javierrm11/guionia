"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

export async function crearIdea(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const titulo = formData.get("titulo");
  const pilar = formData.get("pilar");
  const etiquetas = formData.get("etiquetas");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof titulo !== "string" || titulo.trim().length === 0) {
    throw new Error("El título es obligatorio");
  }

  const { error } = await supabase.from("piezas_contenido").insert({
    plataforma,
    titulo: titulo.trim(),
    pilar: typeof pilar === "string" && pilar ? pilar : null,
    etiquetas: typeof etiquetas === "string" && etiquetas.trim() ? etiquetas.trim() : null,
    estado: "idea",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/contenido/${plataforma}/ideas`);
  redirect(`/contenido/${plataforma}/ideas`);
}
