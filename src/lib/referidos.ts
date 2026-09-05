import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Registra que `referidoId` (el usuario que se acaba de registrar) llegó
 * invitado por `referidorId` (el `ref` de la URL, que es directamente el
 * `user_id` del que comparte el enlace — ver `migrations/26_referidos.sql`).
 * Nunca lanza: un `ref` ausente, inválido, propio, o ya registrado antes no
 * debe romper el alta de la cuenta.
 */
export async function registrarReferido(
  supabase: SupabaseClient,
  referidoId: string,
  referidorId: string | null | undefined
) {
  if (!referidorId || referidorId === referidoId) return;

  await supabase.from("referidos").insert({ referidor_id: referidorId, referido_id: referidoId });
}
