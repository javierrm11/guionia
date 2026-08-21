"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registroAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmarPassword = formData.get("confirmar_password");

  if (typeof email !== "string" || !email) throw new Error("El email es obligatorio");
  if (typeof password !== "string" || password.length < 6) {
    redirect(`/registro?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres")}`);
  }
  if (password !== confirmarPassword) {
    redirect(`/registro?error=${encodeURIComponent("Las contraseñas no coinciden")}`);
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/contenido` },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/contenido");
  }

  redirect("/registro?revisaEmail=1");
}
