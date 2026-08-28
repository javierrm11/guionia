"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMAS, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";

export async function crearCadenciaInicial(formData: FormData) {
  const supabase = await createClient();

  const cadencias: { plataforma: Plataforma; periodo: "semana"; cantidad: number }[] = [];
  const plantilla: { dia_semana: number; plataforma: Plataforma; nota: string }[] = [];

  for (const plataforma of PLATAFORMAS) {
    const dias = [1, 2, 3, 4, 5, 6, 7].filter((dia) => formData.get(`dia_${plataforma}_${dia}`));
    if (dias.length === 0) continue;

    cadencias.push({ plataforma, periodo: "semana", cantidad: dias.length });
    for (const dia of dias) {
      plantilla.push({
        dia_semana: dia,
        plataforma,
        nota: `Publicar en ${PLATAFORMA_LABEL[plataforma]}`,
      });
    }
  }

  if (cadencias.length > 0) {
    const { error } = await supabase.from("cadencia_contenido").insert(cadencias);
    if (error) throw new Error(error.message);
  }
  if (plantilla.length > 0) {
    const { error } = await supabase.from("plantilla_semanal").insert(plantilla);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/contenido");
  revalidatePath("/configuracion/cadencia");
  revalidatePath("/configuracion/plantilla");
  redirect("/contenido");
}
