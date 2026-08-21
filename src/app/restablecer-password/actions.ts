"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function restablecerPasswordAction(formData: FormData) {
  const password = formData.get("password");
  const confirmarPassword = formData.get("confirmar_password");

  if (typeof password !== "string" || password.length < 6) {
    redirect(
      `/restablecer-password?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres")}`
    );
  }
  if (password !== confirmarPassword) {
    redirect(`/restablecer-password?error=${encodeURIComponent("Las contraseñas no coinciden")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/restablecer-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/contenido");
}
