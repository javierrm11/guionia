import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service role key — puentea RLS y puede llamar a la API de
 * administración de Auth (`auth.admin.*`, como borrar una cuenta). Solo para
 * usar dentro de acciones de servidor (`"use server"`); nunca en un Client
 * Component ni expuesto con el prefijo `NEXT_PUBLIC_`, porque esta clave da
 * acceso total a la base de datos saltándose las políticas de RLS.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Project Settings → API → service_role key)",
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
