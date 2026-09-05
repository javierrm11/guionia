import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registrarReferido } from "@/lib/referidos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/contenido";
  const ref = searchParams.get("ref");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (data.user) await registrarReferido(supabase, data.user.id, ref);
      redirect(next);
    }
  }

  redirect(`/login?error=${encodeURIComponent("El enlace no es válido o ha caducado")}`);
}
