"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarReferido } from "@/lib/referidos";

export async function registroAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmarPassword = formData.get("confirmar_password");
  const ref = formData.get("ref");
  const refLimpio = typeof ref === "string" && ref ? ref : null;

  if (typeof email !== "string" || !email) throw new Error("El email es obligatorio");
  if (typeof password !== "string" || password.length < 6) {
    redirect(
      `/registro?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres")}&email=${encodeURIComponent(email)}`
    );
  }
  if (password !== confirmarPassword) {
    redirect(
      `/registro?error=${encodeURIComponent("Las contraseñas no coinciden")}&email=${encodeURIComponent(email)}`
    );
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const emailRedirectTo = refLimpio
    ? `${origin}/auth/confirm?next=/contenido&ref=${encodeURIComponent(refLimpio)}`
    : `${origin}/auth/confirm?next=/contenido`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  if (data.session) {
    if (data.user) await registrarReferido(supabase, data.user.id, refLimpio);
    redirect("/contenido");
  }

  redirect("/registro?revisaEmail=1");
}
