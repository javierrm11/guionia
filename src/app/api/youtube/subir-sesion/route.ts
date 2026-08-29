import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import { iniciarSubidaResumable } from "@/lib/youtube/oauth";

const PRIVACIDADES = ["public", "unlisted", "private"] as const;

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
    return NextResponse.json({ error: "YouTube no está conectado" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion : "";
  const etiquetas: string[] = Array.isArray(body?.etiquetas)
    ? body.etiquetas.filter((t: unknown) => typeof t === "string")
    : [];
  const privacidad = body?.privacidad;
  const publicarEn = typeof body?.publicarEn === "string" && body.publicarEn ? body.publicarEn : undefined;

  if (!titulo) {
    return NextResponse.json({ error: "Falta el título" }, { status: 400 });
  }
  if (!(PRIVACIDADES as readonly string[]).includes(privacidad)) {
    return NextResponse.json({ error: "Privacidad inválida" }, { status: 400 });
  }
  if (publicarEn && Number.isNaN(new Date(publicarEn).getTime())) {
    return NextResponse.json({ error: "Fecha de programación inválida" }, { status: 400 });
  }
  if (publicarEn && new Date(publicarEn).getTime() <= Date.now()) {
    return NextResponse.json({ error: "La fecha programada debe ser futura" }, { status: 400 });
  }

  try {
    const uploadUrl = await iniciarSubidaResumable(accessToken, {
      titulo,
      descripcion,
      etiquetas,
      privacidad,
      publicarEn,
    });
    return NextResponse.json({ uploadUrl });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
