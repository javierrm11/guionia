import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activarPlataformaConectada } from "@/lib/contenido";
import { intercambiarCodigo, obtenerCanalPropio } from "@/lib/youtube/oauth";
import { sincronizarVideosYoutube } from "@/lib/youtube/sincronizar";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const destinoError = new URL(
    "/configuracion/plataformas?youtube_error=1",
    request.url,
  );

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const estadoGuardado = request.cookies.get("youtube_oauth_state")?.value;

  if (!code || !state || state !== estadoGuardado) {
    return NextResponse.redirect(destinoError);
  }

  try {
    const redirectUri = `${request.nextUrl.origin}/api/youtube/callback`;
    const tokens = await intercambiarCodigo(code, redirectUri);

    if (!tokens.refresh_token) {
      throw new Error(
        "Google no devolvió refresh_token — reintenta la conexión",
      );
    }

    const canal = await obtenerCanalPropio(tokens.access_token);
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    const { error } = await supabase.from("youtube_conexiones").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        canal_id: canal.id,
        canal_titulo: canal.titulo,
        canal_thumbnail_url: canal.thumbnailUrl,
      },
      { onConflict: "user_id" },
    );

    if (error) throw new Error(error.message);

    const { eraPrimera } = await activarPlataformaConectada(
      supabase,
      "youtube",
    );

    // Importa los vídeos ya publicados del canal nada más conectar, para no
    // dejar el calendario vacío — el botón "Sincronizar" de
    // /configuracion/plataformas sigue ahí para volver a traer vídeos
    // nuevos más adelante. Si falla, no rompe la conexión (que ya se guardó
    // bien): simplemente no se ve el aviso de "X importados".
    const importados = await sincronizarVideosYoutube(
      supabase,
      tokens.access_token,
    ).catch(() => null);

    let destinoFinal: URL;
    if (eraPrimera) {
      destinoFinal = new URL("/contenido/bienvenida", request.url);
    } else {
      destinoFinal = new URL("/configuracion/plataformas", request.url);
      destinoFinal.searchParams.set("youtube_conectado", "1");
      if (importados != null) {
        destinoFinal.searchParams.set("youtube_importados", String(importados));
      }
    }

    const response = NextResponse.redirect(destinoFinal);
    response.cookies.delete("youtube_oauth_state");
    return response;
  } catch (error) {
    console.error("Error conectando YouTube:", error);
    return NextResponse.redirect(destinoError);
  }
}
