import { notFound } from "next/navigation";
import { Clapperboard, Lightbulb } from "lucide-react";
import { Tile } from "@/components/Tile";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, isPlataforma } from "@/lib/plataformas";

export default async function PlataformaPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const IconoPlataforma = PLATAFORMA_ICON[plataforma];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <IconoPlataforma size={20} strokeWidth={1.5} className="text-accent" />
        <h1 className="text-h1">{PLATAFORMA_LABEL[plataforma]}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Tile href={`/contenido/${plataforma}/ideas`} label="Ideas" icon={Lightbulb} />
        <Tile href={`/contenido/${plataforma}/videos`} label="Vídeos" icon={Clapperboard} />
      </div>
    </div>
  );
}
