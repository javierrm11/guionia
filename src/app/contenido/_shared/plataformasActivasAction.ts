"use server";

import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";

export async function obtenerPlataformasActivas() {
  const supabase = await createClient();
  const { data } = await supabase.from("plataformas_activas").select("plataforma");
  return (data ?? []).map((r) => r.plataforma).filter(isPlataforma);
}
