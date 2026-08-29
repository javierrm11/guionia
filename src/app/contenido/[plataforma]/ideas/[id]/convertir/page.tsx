import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO } from "@/lib/plataformas";
import { GuionForm } from "@/components/GuionForm";
import { convertirEnGuion } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConvertirEnGuionPage({
  params,
}: {
  params: Promise<{ plataforma: string; id: string }>;
}) {
  const { plataforma, id } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const supabase = await createClient();

  const { data: idea } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("id", id)
    .eq("plataforma", plataforma)
    .maybeSingle();

  if (!idea) notFound();

  const { data: estructuras } = await supabase
    .from("estructuras_guion")
    .select("*, estructura_escenas(*)")
    .eq("plataforma", plataforma)
    .order("duracion_segundos");

  const { data: frases } = await supabase
    .from("frases_guardadas")
    .select("id, tipo_escena, texto")
    .eq("plataforma", plataforma)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <p className="text-body text-text-secondary">{idea.titulo}</p>

      <GuionForm
        plataforma={plataforma}
        ideaId={idea.id}
        tituloInicial={idea.titulo}
        pilarInicial={idea.pilar}
        estructuras={estructuras ?? []}
        frases={frases ?? []}
        fechaHoy={todayISO()}
        action={convertirEnGuion}
      />
    </div>
  );
}
