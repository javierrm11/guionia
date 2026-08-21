import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construirUrlAutorizacion, generarPkce } from "@/lib/tiktok/oauth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const { codeVerifier, codeChallenge } = generarPkce();
  const redirectUri = `${request.nextUrl.origin}/api/tiktok/callback`;
  const authUrl = construirUrlAutorizacion(redirectUri, state, codeChallenge);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("tiktok_oauth_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
