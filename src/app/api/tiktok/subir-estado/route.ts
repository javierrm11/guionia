import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/tiktok/conexion";
import { consultarEstadoPublicacion } from "@/lib/tiktok/oauth";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const accessToken = await obtenerAccessTokenValido(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "TikTok no está conectado" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const publishId = typeof body?.publishId === "string" ? body.publishId : "";
  if (!publishId) {
    return NextResponse.json({ error: "Falta el id de publicación" }, { status: 400 });
  }

  try {
    const estado = await consultarEstadoPublicacion(accessToken, publishId);
    return NextResponse.json(estado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
