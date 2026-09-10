"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { registrarHistorialPieza } from "@/lib/contenido";

export async function crearIdea(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const titulo = formData.get("titulo");
  const pilar = formData.get("pilar");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof titulo !== "string" || titulo.trim().length === 0) {
    throw new Error("El título es obligatorio");
  }

  const { data: idea, error } = await supabase
    .from("piezas_contenido")
    .insert({
      plataforma,
      titulo: titulo.trim(),
      pilar: typeof pilar === "string" && pilar ? pilar : null,
      estado: "idea",
    })
    .select("id")
    .single();

  if (error || !idea) {
    throw new Error(error?.message ?? "No se pudo crear la idea");
  }

  await registrarHistorialPieza(supabase, idea.id, "idea");

  revalidatePath(`/contenido/${plataforma}/ideas`);
  redirect(`/contenido/${plataforma}/ideas`);
}
