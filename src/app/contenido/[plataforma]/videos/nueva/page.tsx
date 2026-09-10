import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma, todayISO } from "@/lib/plataformas";
import { GuionForm } from "@/components/GuionForm";
import { obtenerEstructuraSugerida } from "@/lib/estructuraSugerida";
import { obtenerPilarSugerido } from "@/lib/pilarSugerido";
import { obtenerMejorMomentoPublicacion } from "@/lib/youtube/mejorMomentoPublicacion";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: estructuras },
    { data: frases },
    estructuraSugeridaId,
    pilarSugerido,
    mejorMomento,
  ] = await Promise.all([
    supabase
      .from("estructuras_guion")
      .select("*, estructura_escenas(*)")
      .eq("plataforma", plataforma)
      .order("duracion_segundos"),
    supabase
      .from("frases_guardadas")
      .select("id, tipo_escena, texto")
      .eq("plataforma", plataforma)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    obtenerEstructuraSugerida(supabase, plataforma),
    obtenerPilarSugerido(supabase, plataforma),
    plataforma === "youtube" && user
      ? obtenerMejorMomentoPublicacion(supabase, user.id)
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
        <GuionForm
          plataforma={plataforma}
          estructuras={estructuras ?? []}
          estructuraSugeridaId={estructuraSugeridaId ?? undefined}
          pilarInicial={pilarSugerido}
          mejorMomento={mejorMomento}
          frases={frases ?? []}
          fechaHoy={fecha ?? todayISO()}
          action={crearVideoDirecto}
        />
      </div>
    </div>
  );
}
