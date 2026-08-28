"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { desactivarPlataforma } from "@/lib/contenido";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import { obtenerVideosDelCanal } from "@/lib/youtube/oauth";
import { obtenerAccessTokenValido as obtenerAccessTokenValidoTiktok } from "@/lib/tiktok/conexion";
import { obtenerVideosDelUsuario } from "@/lib/tiktok/oauth";

export async function guardarPlataformasActivas(formData: FormData) {
  const supabase = await createClient();

  const seleccionadas = formData
    .getAll("plataforma")
    .filter((v): v is string => typeof v === "string")
    .filter(isPlataforma);

  if (seleccionadas.length === 0) {
    redirect("/configuracion/plataformas?plataformas_error=1");
  }

  const { data: actuales } = await supabase.from("plataformas_activas").select("plataforma");
  const actualesSet = new Set((actuales ?? []).map((r) => r.plataforma));
  const nuevasSet = new Set(seleccionadas);
  const esPrimeraVez = actualesSet.size === 0;

  const aBorrar = [...actualesSet].filter((p) => !nuevasSet.has(p));
  const aInsertar = [...nuevasSet].filter((p) => !actualesSet.has(p));

  if (aBorrar.length > 0) {
    await supabase.from("plataformas_activas").delete().in("plataforma", aBorrar);
  }
  if (aInsertar.length > 0) {
    await supabase
      .from("plataformas_activas")
      .insert(aInsertar.map((plataforma) => ({ plataforma })));
  }

  revalidatePath("/contenido");
  revalidatePath("/configuracion/plataformas");

  // Primera vez que se activa alguna plataforma: pedir la cadencia semanal de
  // cada una para generar cadencia + plantilla automáticamente. En una edición
  // posterior (ya había plataformas activas) se va directo a Control.
  redirect(esPrimeraVez ? "/contenido/bienvenida" : "/contenido");
}

export async function desconectarYoutube() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("youtube_conexiones").delete().eq("user_id", user.id);
  if (error) throw new Error(error.message);

  await desactivarPlataforma(supabase, "youtube");

  revalidatePath("/configuracion/plataformas");
  revalidatePath("/contenido");
}

export async function sincronizarYoutube() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const accessToken = await obtenerAccessTokenValido(supabase, user.id);
  if (!accessToken) {
    redirect("/configuracion/plataformas?youtube_error=1");
  }

  const videosCanal = await obtenerVideosDelCanal(accessToken);

  let importados = 0;
  if (videosCanal.length > 0) {
    const idsCanal = videosCanal.map((v) => v.videoId);
    const { data: existentes } = await supabase
      .from("piezas_contenido")
      .select("youtube_video_id")
      .eq("plataforma", "youtube")
      .in("youtube_video_id", idsCanal);

    const idsExistentes = new Set((existentes ?? []).map((r) => r.youtube_video_id));
    const nuevos = videosCanal
      .filter((v) => !idsExistentes.has(v.videoId))
      .sort((a, b) => new Date(a.publicadoEn).getTime() - new Date(b.publicadoEn).getTime());

    if (nuevos.length > 0) {
      const { data: ultimo } = await supabase
        .from("piezas_contenido")
        .select("numero")
        .eq("plataforma", "youtube")
        .not("numero", "is", null)
        .order("numero", { ascending: false })
        .limit(1)
        .maybeSingle();

      let siguienteNumero = (ultimo?.numero ?? 0) + 1;

      const filas = nuevos.map((v) => ({
        plataforma: "youtube" as const,
        titulo: v.titulo,
        estado: "publicado" as const,
        fecha_publicacion: v.publicadoEn.slice(0, 10),
        url_publicado: `https://www.youtube.com/watch?v=${v.videoId}`,
        youtube_video_id: v.videoId,
        numero: siguienteNumero++,
      }));

      const { error } = await supabase.from("piezas_contenido").insert(filas);
      if (error) throw new Error(error.message);
      importados = filas.length;
    }
  }

  revalidatePath("/configuracion/plataformas");
  revalidatePath("/contenido/youtube/videos");
  redirect(`/configuracion/plataformas?youtube_importados=${importados}`);
}

export async function desconectarTiktok() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("tiktok_conexiones").delete().eq("user_id", user.id);
  if (error) throw new Error(error.message);

  await desactivarPlataforma(supabase, "tiktok");

  revalidatePath("/configuracion/plataformas");
  revalidatePath("/contenido");
}

export async function sincronizarTiktok() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const accessToken = await obtenerAccessTokenValidoTiktok(supabase, user.id);
  if (!accessToken) {
    redirect("/configuracion/plataformas?tiktok_error=1");
  }

  const videosCuenta = await obtenerVideosDelUsuario(accessToken);

  let importados = 0;
  if (videosCuenta.length > 0) {
    const idsCuenta = videosCuenta.map((v) => v.videoId);
    const { data: existentes } = await supabase
      .from("piezas_contenido")
      .select("tiktok_video_id")
      .eq("plataforma", "tiktok")
      .in("tiktok_video_id", idsCuenta);

    const idsExistentes = new Set((existentes ?? []).map((r) => r.tiktok_video_id));
    const nuevos = videosCuenta
      .filter((v) => !idsExistentes.has(v.videoId))
      .sort((a, b) => new Date(a.publicadoEn).getTime() - new Date(b.publicadoEn).getTime());

    if (nuevos.length > 0) {
      const { data: ultimo } = await supabase
        .from("piezas_contenido")
        .select("numero")
        .eq("plataforma", "tiktok")
        .not("numero", "is", null)
        .order("numero", { ascending: false })
        .limit(1)
        .maybeSingle();

      let siguienteNumero = (ultimo?.numero ?? 0) + 1;

      const filas = nuevos.map((v) => ({
        plataforma: "tiktok" as const,
        titulo: v.titulo || "Vídeo de TikTok",
        estado: "publicado" as const,
        fecha_publicacion: v.publicadoEn.slice(0, 10),
        url_publicado: v.shareUrl || null,
        tiktok_video_id: v.videoId,
        numero: siguienteNumero++,
      }));

      const { error } = await supabase.from("piezas_contenido").insert(filas);
      if (error) throw new Error(error.message);
      importados = filas.length;
    }
  }

  revalidatePath("/configuracion/plataformas");
  revalidatePath("/contenido/tiktok/videos");
  redirect(`/configuracion/plataformas?tiktok_importados=${importados}`);
}
