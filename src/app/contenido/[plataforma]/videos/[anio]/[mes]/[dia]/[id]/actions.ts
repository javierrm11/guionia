"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { ESTADOS_VIDEO, TIPOS_ESCENA } from "@/lib/contenido";
import { extraerVideoId as extraerVideoIdYoutube } from "@/lib/youtube/oauth";
import { extraerVideoId as extraerVideoIdTiktok } from "@/lib/tiktok/oauth";

export async function avanzarEstado(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const plataforma = formData.get("plataforma");
  const siguiente = formData.get("siguiente");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) {
    throw new Error("Guion inválido");
  }
  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof siguiente !== "string" || !(ESTADOS_VIDEO as readonly string[]).includes(siguiente)) {
    throw new Error("Estado inválido");
  }
  if (typeof redirectTo !== "string" || !redirectTo) {
    throw new Error("Ruta de destino inválida");
  }

  const { error } = await supabase
    .from("piezas_contenido")
    .update({ estado: siguiente })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function publicarConMetadatos(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const plataforma = formData.get("plataforma");
  const redirectTo = formData.get("redirectTo");
  const tituloPublicacion = formData.get("titulo_publicacion");
  const descripcionPublicacion = formData.get("descripcion_publicacion");
  const etiquetasPublicacion = formData.get("etiquetas_publicacion");

  if (typeof id !== "string" || !id) {
    throw new Error("Guion inválido");
  }
  if (typeof plataforma !== "string" || !isPlataforma(plataforma)) {
    throw new Error("Plataforma inválida");
  }
  if (typeof redirectTo !== "string" || !redirectTo) {
    throw new Error("Ruta de destino inválida");
  }

  const limpiar = (v: FormDataEntryValue | null) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      estado: "publicado",
      titulo_publicacion: plataforma === "youtube" ? limpiar(tituloPublicacion) : null,
      descripcion_publicacion: limpiar(descripcionPublicacion),
      etiquetas_publicacion: plataforma === "youtube" ? limpiar(etiquetasPublicacion) : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function guardarUrlPublicado(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const url = formData.get("url_publicado");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Guion inválido");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const urlLimpia = typeof url === "string" && url.trim() ? url.trim() : null;

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      url_publicado: urlLimpia,
      youtube_video_id: urlLimpia ? extraerVideoIdYoutube(urlLimpia) : null,
      tiktok_video_id: urlLimpia ? extraerVideoIdTiktok(urlLimpia) : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(redirectTo);
}

export async function guardarTextoEscena(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const texto = formData.get("texto");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Escena inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const nuevoTexto = typeof texto === "string" ? texto : null;

  const { data: actual } = await supabase
    .from("escenas_guion")
    .select("texto")
    .eq("id", id)
    .maybeSingle();

  if (actual?.texto && actual.texto.trim() && actual.texto !== nuevoTexto) {
    await supabase.from("escena_versiones").insert({ escena_id: id, texto: actual.texto });
  }

  const { error } = await supabase.from("escenas_guion").update({ texto: nuevoTexto }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function restaurarVersionEscena(formData: FormData) {
  const supabase = await createClient();

  const escenaId = formData.get("escena_id");
  const versionId = formData.get("version_id");
  const redirectTo = formData.get("redirectTo");

  if (typeof escenaId !== "string" || !escenaId) throw new Error("Escena inválida");
  if (typeof versionId !== "string" || !versionId) throw new Error("Versión inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { data: version } = await supabase
    .from("escena_versiones")
    .select("texto")
    .eq("id", versionId)
    .maybeSingle();

  if (!version) throw new Error("Versión no encontrada");

  const { data: actual } = await supabase
    .from("escenas_guion")
    .select("texto")
    .eq("id", escenaId)
    .maybeSingle();

  if (actual?.texto && actual.texto.trim() && actual.texto !== version.texto) {
    await supabase.from("escena_versiones").insert({ escena_id: escenaId, texto: actual.texto });
  }

  const { error } = await supabase
    .from("escenas_guion")
    .update({ texto: version.texto })
    .eq("id", escenaId);

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function agregarEscenaGuion(formData: FormData) {
  const supabase = await createClient();

  const piezaId = formData.get("pieza_id");
  const tipoEscena = formData.get("tipo_escena");
  const duracionSegundos = formData.get("duracion_segundos");
  const redirectTo = formData.get("redirectTo");

  if (typeof piezaId !== "string" || !piezaId) throw new Error("Guion inválido");
  if (
    typeof tipoEscena !== "string" ||
    !(TIPOS_ESCENA as readonly string[]).includes(tipoEscena)
  ) {
    throw new Error("Tipo de escena inválido");
  }
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const duracionNum = Number(duracionSegundos);

  const { data: ultima } = await supabase
    .from("escenas_guion")
    .select("orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("escenas_guion").insert({
    pieza_id: piezaId,
    orden: (ultima?.orden ?? 0) + 1,
    tipo_escena: tipoEscena,
    duracion_segundos: Number.isInteger(duracionNum) && duracionNum > 0 ? duracionNum : null,
    texto: null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function eliminarEscenaGuion(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Escena inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { error } = await supabase.from("escenas_guion").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function moverEscenaGuion(formData: FormData) {
  const supabase = await createClient();

  const piezaId = formData.get("pieza_id");
  const id = formData.get("id");
  const direccion = formData.get("direccion");
  const redirectTo = formData.get("redirectTo");

  if (typeof piezaId !== "string" || !piezaId) throw new Error("Guion inválido");
  if (direccion !== "arriba" && direccion !== "abajo") throw new Error("Dirección inválida");
  if (typeof redirectTo !== "string" || !redirectTo) throw new Error("Ruta inválida");

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("id, orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: true });

  if (!escenas) return;

  const index = escenas.findIndex((e) => e.id === id);
  const vecinoIndex = direccion === "arriba" ? index - 1 : index + 1;
  if (index === -1 || vecinoIndex < 0 || vecinoIndex >= escenas.length) return;

  const actual = escenas[index];
  const vecino = escenas[vecinoIndex];

  await Promise.all([
    supabase.from("escenas_guion").update({ orden: vecino.orden }).eq("id", actual.id),
    supabase.from("escenas_guion").update({ orden: actual.orden }).eq("id", vecino.id),
  ]);

  revalidatePath(redirectTo);
}
