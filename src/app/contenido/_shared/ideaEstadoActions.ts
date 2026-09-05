"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarHistorialPieza } from "@/lib/contenido";

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

  await registrarHistorialPieza(supabase, id, "descartada");

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

/** Deshace un `descartarIdea` reciente — vuelve la pieza a "idea". Se llama
 *  desde el toast de "Idea descartada · Deshacer" (`ToastDeshacerIdea`), no
 *  desde un botón fijo en la pantalla. */
export async function restaurarIdea(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Idea inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase.from("piezas_contenido").update({ estado: "idea" }).eq("id", id);

  if (error) throw new Error(error.message);

  await registrarHistorialPieza(supabase, id, "idea");

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
