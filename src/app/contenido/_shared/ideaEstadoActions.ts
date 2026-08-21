"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function descartarIdea(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Idea inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase
    .from("piezas_contenido")
    .update({ estado: "descartada" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
