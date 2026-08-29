import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/tiktok/conexion";
import { iniciarSubidaVideo } from "@/lib/tiktok/oauth";

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
  const titulo = typeof body?.titulo === "string" ? body.titulo : "";
  const videoSize = Number(body?.videoSize);
  const chunkSize = Number(body?.chunkSize);
  const totalChunkCount = Number(body?.totalChunkCount);

  if (
    !Number.isInteger(videoSize) ||
    videoSize <= 0 ||
    !Number.isInteger(chunkSize) ||
    chunkSize <= 0 ||
    !Number.isInteger(totalChunkCount) ||
    totalChunkCount <= 0
  ) {
    return NextResponse.json({ error: "Datos de subida inválidos" }, { status: 400 });
  }

  try {
    const { publishId, uploadUrl } = await iniciarSubidaVideo(accessToken, {
      titulo,
      videoSize,
      chunkSize,
      totalChunkCount,
    });
    return NextResponse.json({ publishId, uploadUrl });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
