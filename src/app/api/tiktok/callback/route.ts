import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activarPlataformaConectada } from "@/lib/contenido";
import { intercambiarCodigo, obtenerCuentaPropia } from "@/lib/tiktok/oauth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const destinoError = new URL("/configuracion/plataformas?tiktok_error=1", request.url);
  const destinoOk = new URL("/configuracion/plataformas?tiktok_conectado=1", request.url);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const estadoGuardado = request.cookies.get("tiktok_oauth_state")?.value;
  const codeVerifier = request.cookies.get("tiktok_oauth_verifier")?.value;

  if (!code || !state || state !== estadoGuardado || !codeVerifier) {
    return NextResponse.redirect(destinoError);
  }

  try {
    const redirectUri = `${request.nextUrl.origin}/api/tiktok/callback`;
    const tokens = await intercambiarCodigo(code, redirectUri, codeVerifier);
    const cuenta = await obtenerCuentaPropia(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await supabase.from("tiktok_conexiones").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        open_id: cuenta.openId,
        display_name: cuenta.displayName,
        avatar_url: cuenta.avatarUrl,
      },
      { onConflict: "user_id" }
    );

    if (error) throw new Error(error.message);

    const { eraPrimera } = await activarPlataformaConectada(supabase, "tiktok");
    const destinoFinal = eraPrimera ? new URL("/contenido/bienvenida", request.url) : destinoOk;

    const response = NextResponse.redirect(destinoFinal);
    response.cookies.delete("tiktok_oauth_state");
    response.cookies.delete("tiktok_oauth_verifier");
    return response;
  } catch (error) {
    console.error("Error conectando TikTok:", error);
    return NextResponse.redirect(destinoError);
  }
}
