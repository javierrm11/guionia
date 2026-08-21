import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { intercambiarCodigo, obtenerCanalPropio } from "@/lib/youtube/oauth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const destinoError = new URL("/configuracion/plataformas?youtube_error=1", request.url);
  const destinoOk = new URL("/configuracion/plataformas?youtube_conectado=1", request.url);

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
      throw new Error("Google no devolvió refresh_token — reintenta la conexión");
    }

    const canal = await obtenerCanalPropio(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

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
      { onConflict: "user_id" }
    );

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Error conectando YouTube:", error);
    return NextResponse.redirect(destinoError);
  }

  const response = NextResponse.redirect(destinoOk);
  response.cookies.delete("youtube_oauth_state");
  return response;
}
