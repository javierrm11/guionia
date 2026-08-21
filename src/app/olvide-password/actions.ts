"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function olvidePasswordAction(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) throw new Error("El email es obligatorio");

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/restablecer-password`,
  });

  // Se muestra siempre el mismo mensaje, exista o no esa cuenta,
  // para no revelar qué emails están registrados.
  redirect("/olvide-password?enviado=1");
}
