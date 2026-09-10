"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO } from "@/lib/plataformas";
import { TIPOS_ESCENA, registrarHistorialPieza } from "@/lib/contenido";
import { extraerVideoId as extraerVideoIdYoutube } from "@/lib/youtube/oauth";
import { extraerVideoId as extraerVideoIdTiktok } from "@/lib/tiktok/oauth";

/**
 * Único punto de la app para enlazar un guion con el vídeo ya publicado
 * (en YouTube/TikTok, fuera de aquí) — no hay grabación, edición ni subida
 * dentro de la app: se escribe el guion, se publica donde corresponda, y
 * aquí se pega la URL para que las estadísticas y la cadencia lo cuenten.
 * Pegar una URL marca la pieza como "publicado"; borrarla la devuelve a
 * "guion escrito" para no dejar un "publicado" fantasma en la cadencia.
 */
export async function guardarUrlPublicado(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const url = formData.get("url_publicado");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Guion inválido");
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

  const urlLimpia = typeof url === "string" && url.trim() ? url.trim() : null;
  const nuevoEstado = urlLimpia ? "publicado" : "guion_escrito";

  const { error } = await supabase
    .from("piezas_contenido")
    .update({
      estado: nuevoEstado,
      url_publicado: urlLimpia,
      youtube_video_id: urlLimpia ? extraerVideoIdYoutube(urlLimpia) : null,
      tiktok_video_id: urlLimpia ? extraerVideoIdTiktok(urlLimpia) : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await registrarHistorialPieza(supabase, id, nuevoEstado);

  revalidatePath(redirectTo);
}

type EscenaOriginal = {
  deleted_at: string | null;
  orden: number;
  tipo_escena: string;
  duracion_segundos: number | null;
  texto: string | null;
  frase_origen_id: string | null;
};

/** Crea un guion nuevo en otra plataforma a partir de uno ya escrito —
 *  mismo título, mismo pilar y las mismas escenas (o el texto libre, si no
 *  tiene escenas), como punto de partida para ajustar al formato de la
 *  plataforma destino. Fecha de publicación: hoy, por defecto — se puede
 *  reprogramar después arrastrando la pieza en el calendario mensual. */
export async function adaptarAOtraPlataforma(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const plataformaDestino = formData.get("plataforma_destino");

  if (typeof id !== "string" || !id) throw new Error("Guion inválido");
  if (
    typeof plataformaDestino !== "string" ||
    !isPlataforma(plataformaDestino)
  ) {
    throw new Error("Plataforma inválida");
  }

  const { data: original } = await supabase
    .from("piezas_contenido")
    .select("*, escenas_guion(*)")
    .eq("id", id)
    .maybeSingle();

  if (!original) throw new Error("Guion no encontrado");

  const escenasActivas = (
    (original.escenas_guion ?? []) as EscenaOriginal[]
  ).filter((e) => !e.deleted_at);
  const hoy = todayISO();

  const { data: copia, error } = await supabase
    .from("piezas_contenido")
    .insert({
      plataforma: plataformaDestino,
      pilar: original.pilar,
      titulo: original.titulo,
      estado: "guion_escrito",
      fecha_publicacion: hoy,
      texto: escenasActivas.length === 0 ? original.texto : null,
    })
    .select("id")
    .single();

  if (error || !copia) {
    throw new Error(error?.message ?? "No se pudo adaptar el guion");
  }

  await registrarHistorialPieza(supabase, copia.id, "guion_escrito");

  if (escenasActivas.length > 0) {
    const { error: escenasError } = await supabase.from("escenas_guion").insert(
      escenasActivas.map((e) => ({
        pieza_id: copia.id,
        orden: e.orden,
        tipo_escena: e.tipo_escena,
        duracion_segundos: e.duracion_segundos,
        texto: e.texto,
        frase_origen_id: e.frase_origen_id,
      })),
    );
    if (escenasError) throw new Error(escenasError.message);
  }

  const [anio, mes, dia] = hoy.split("-");
  redirect(
    `/contenido/${plataformaDestino}/videos/${anio}/${mes}/${dia}/${copia.id}`,
  );
}

export async function guardarTextoEscena(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const texto = formData.get("texto");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Escena inválida");
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

  const nuevoTexto = typeof texto === "string" ? texto : null;

  const { data: actual } = await supabase
    .from("escenas_guion")
    .select("texto")
    .eq("id", id)
    .maybeSingle();

  if (actual?.texto && actual.texto.trim() && actual.texto !== nuevoTexto) {
    await supabase
      .from("escena_versiones")
      .insert({ escena_id: id, texto: actual.texto });
  }

  const { error } = await supabase
    .from("escenas_guion")
    .update({ texto: nuevoTexto })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function restaurarVersionEscena(formData: FormData) {
  const supabase = await createClient();

  const escenaId = formData.get("escena_id");
  const versionId = formData.get("version_id");
  const redirectTo = formData.get("redirectTo");

  if (typeof escenaId !== "string" || !escenaId)
    throw new Error("Escena inválida");
  if (typeof versionId !== "string" || !versionId)
    throw new Error("Versión inválida");
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

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
    await supabase
      .from("escena_versiones")
      .insert({ escena_id: escenaId, texto: actual.texto });
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

  if (typeof piezaId !== "string" || !piezaId)
    throw new Error("Guion inválido");
  if (
    typeof tipoEscena !== "string" ||
    !(TIPOS_ESCENA as readonly string[]).includes(tipoEscena)
  ) {
    throw new Error("Tipo de escena inválido");
  }
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

  const duracionNum = Number(duracionSegundos);

  const { data: ultima } = await supabase
    .from("escenas_guion")
    .select("orden")
    .eq("pieza_id", piezaId)
    .is("deleted_at", null)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("escenas_guion").insert({
    pieza_id: piezaId,
    orden: (ultima?.orden ?? 0) + 1,
    tipo_escena: tipoEscena,
    duracion_segundos:
      Number.isInteger(duracionNum) && duracionNum > 0 ? duracionNum : null,
    texto: null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

/** Borrado suave — la escena pasa a la papelera (`/configuracion/papelera`)
 *  en vez de desaparecer para siempre. */
export async function eliminarEscenaGuion(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id) throw new Error("Escena inválida");
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

  const { error } = await supabase
    .from("escenas_guion")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(redirectTo);
}

export async function moverEscenaGuion(formData: FormData) {
  const supabase = await createClient();

  const piezaId = formData.get("pieza_id");
  const id = formData.get("id");
  const direccion = formData.get("direccion");
  const redirectTo = formData.get("redirectTo");

  if (typeof piezaId !== "string" || !piezaId)
    throw new Error("Guion inválido");
  if (direccion !== "arriba" && direccion !== "abajo")
    throw new Error("Dirección inválida");
  if (typeof redirectTo !== "string" || !redirectTo)
    throw new Error("Ruta inválida");

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("id, orden")
    .eq("pieza_id", piezaId)
    .is("deleted_at", null)
    .order("orden", { ascending: true });

  if (!escenas) return;

  const index = escenas.findIndex((e) => e.id === id);
  const vecinoIndex = direccion === "arriba" ? index - 1 : index + 1;
  if (index === -1 || vecinoIndex < 0 || vecinoIndex >= escenas.length) return;

  const actual = escenas[index];
  const vecino = escenas[vecinoIndex];

  await Promise.all([
    supabase
      .from("escenas_guion")
      .update({ orden: vecino.orden })
      .eq("id", actual.id),
    supabase
      .from("escenas_guion")
      .update({ orden: actual.orden })
      .eq("id", vecino.id),
  ]);

  revalidatePath(redirectTo);
}
