"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Marca un vídeo como "no me interesa" — deja de aparecer en tendencias
 *  para este usuario (`obtenerVideosParaTi` lo filtra a partir de aquí). */
export async function ocultarVideoTendencia(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const videoId = formData.get("videoId");
  if (typeof videoId !== "string" || !videoId)
    throw new Error("Vídeo inválido");

  const { error } = await supabase
    .from("tendencias_ocultas")
    .insert({ user_id: user.id, video_id: videoId });

  if (error) throw new Error(error.message);

  revalidatePath("/contenido/tendencias");
}
