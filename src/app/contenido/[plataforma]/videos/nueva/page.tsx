import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO } from "@/lib/plataformas";
import { GuionForm } from "@/components/GuionForm";
import { crearVideoDirecto } from "./actions";

export const dynamic = "force-dynamic";

export default async function NuevoVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ plataforma: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { plataforma } = await params;
  const { fecha } = await searchParams;
  if (!isPlataforma(plataforma)) notFound();

  const supabase = await createClient();

  const { data: estructuras } = await supabase
    .from("estructuras_guion")
    .select("*, estructura_escenas(*)")
    .eq("plataforma", plataforma)
    .order("duracion_segundos");

  const { data: frases } = await supabase
    .from("frases_guardadas")
    .select("id, tipo_escena, texto")
    .eq("plataforma", plataforma)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <GuionForm
        plataforma={plataforma}
        estructuras={estructuras ?? []}
        frases={frases ?? []}
        fechaHoy={fecha ?? todayISO()}
        action={crearVideoDirecto}
      />
    </div>
  );
}
