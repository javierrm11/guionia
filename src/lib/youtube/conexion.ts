import type { SupabaseClient } from "@supabase/supabase-js";
import { renovarAccessToken } from "./oauth";

/**
 * Devuelve un access_token válido para el usuario, renovándolo si ha
 * caducado. `null` si no tiene YouTube conectado, o si la renovación falla
 * (p. ej. el usuario revocó el acceso desde su cuenta de Google) — nunca
 * lanza, para no tirar abajo toda la pantalla por un fallo de un tercero;
 * cada consumidor ya sabe pedir (re)conectar la cuenta cuando recibe `null`.
 */
export async function obtenerAccessTokenValido(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: conexion } = await supabase
    .from("youtube_conexiones")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!conexion) return null;

  const expiraEn = new Date(conexion.expires_at).getTime() - Date.now();
  if (expiraEn > 60_000) {
    return conexion.access_token;
  }

  try {
    const tokens = await renovarAccessToken(conexion.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase
      .from("youtube_conexiones")
      .update({ access_token: tokens.access_token, expires_at: expiresAt })
      .eq("user_id", userId);

    return tokens.access_token;
  } catch {
    return null;
  }
}
