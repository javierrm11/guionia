"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Elimina la cuenta del usuario de verdad — borra la fila de `auth.users`
 * vía la API de administración (requiere `SUPABASE_SERVICE_ROLE_KEY`, no se
 * puede hacer con la sesión normal del usuario). Todas las tablas de
 * contenido (`piezas_contenido`, `frases_guardadas`, conexiones de
 * YouTube/TikTok, etc.) tienen `user_id ... on delete cascade`, así que se
 * borran solas al eliminar el usuario — no hace falta borrarlas una a una
 * aquí. Irreversible: no hay papelera para esto.
 */
export async function eliminarCuenta() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/login?cuenta_eliminada=1");
}
