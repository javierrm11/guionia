"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { TIPOS_ESCENA } from "@/lib/contenido";

export async function convertirEnGuion(formData: FormData) {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma");
  const id = formData.get("id");
  const texto = formData.get("texto");
  const fechaPublicacion = formData.get("fecha_publicacion");
  const estructuraId = formData.get("estructura_id");

  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof id !== "string" || !id) {
    throw new Error("Idea inválida");
  }
  if (typeof fechaPublicacion !== "string" || !fechaPublicacion) {
    throw new Error("La fecha de publicación es obligatoria");
  }

  const usaEstructura = typeof estructuraId === "string" && estructuraId.length > 0;

  const tiposEscena = formData.getAll("escena_tipo").map(String);
  const duracionesEscena = formData.getAll("escena_duracion").map(String);
  const textosEscena = formData.getAll("escena_texto").map(String);

  if (usaEstructura) {
    const invalido = tiposEscena.some(
      (t) => !(TIPOS_ESCENA as readonly string[]).includes(t)
    );
    if (invalido || tiposEscena.length === 0) {
      throw new Error("Escenas inválidas");
    }
  } else if (typeof texto !== "string" || texto.trim().length === 0) {
    throw new Error("El texto del guion es obligatorio si no eliges una estructura");
  }

  const { data: ultimo } = await supabase
    .from("piezas_contenido")
    .select("numero")
    .eq("plataforma", plataforma)
    .not("numero", "is", null)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();

  const siguienteNumero = (ultimo?.numero ?? 0) + 1;

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      texto: usaEstructura ? null : (texto as string).trim(),
      fecha_publicacion: fechaPublicacion,
      numero: siguienteNumero,
      estado: "guion_escrito",
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (usaEstructura) {
    const { error: escenasError } = await supabase.from("escenas_guion").insert(
      tiposEscena.map((tipo, index) => ({
        pieza_id: id,
        orden: index + 1,
        tipo_escena: tipo,
        duracion_segundos: Number(duracionesEscena[index]) || null,
        texto: textosEscena[index]?.trim() ? textosEscena[index].trim() : null,
      }))
    );

    if (escenasError) {
      throw new Error(escenasError.message);
    }
  }

  const [anio, mes, dia] = fechaPublicacion.split("-");

  revalidatePath(`/contenido/${plataforma}/ideas`);
  revalidatePath(`/contenido/${plataforma}/videos`);
  redirect(`/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${id}`);
}
