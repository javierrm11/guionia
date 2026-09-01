import { createClient } from "@/lib/supabase/server";
import { FilaPapelera } from "@/components/FilaPapelera";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import {
  eliminarEscenaDefinitivo,
  eliminarFraseDefinitivo,
  restaurarEscena,
  restaurarFrase,
} from "./actions";

export const dynamic = "force-dynamic";

type ElementoPapelera = {
  id: string;
  tipoBadge: "Escena" | "Hook" | "CTA";
  texto: string;
  contexto: string;
  deletedAt: string;
  restaurar: (formData: FormData) => Promise<void>;
  eliminar: (formData: FormData) => Promise<void>;
};

export default async function PapeleraPage() {
  const supabase = await createClient();

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("id, texto, tipo_escena, deleted_at, pieza_id")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const piezaIds = [...new Set((escenas ?? []).map((e) => e.pieza_id))];
  const { data: piezas } =
    piezaIds.length > 0
      ? await supabase.from("piezas_contenido").select("id, titulo").in("id", piezaIds)
      : { data: [] };
  const tituloPorPieza = new Map((piezas ?? []).map((p) => [p.id, p.titulo]));

  const { data: frases } = await supabase
    .from("frases_guardadas")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const elementos: ElementoPapelera[] = [
    ...(escenas ?? []).map((e) => ({
      id: e.id,
      tipoBadge: "Escena" as const,
      texto: e.texto || "(sin texto)",
      contexto: `${TIPO_ESCENA_LABEL[e.tipo_escena as TipoEscena]} · de: ${
        tituloPorPieza.get(e.pieza_id) ?? "guion eliminado"
      }`,
      deletedAt: e.deleted_at as string,
      restaurar: restaurarEscena,
      eliminar: eliminarEscenaDefinitivo,
    })),
    ...(frases ?? []).map((f) => ({
      id: f.id,
      tipoBadge: f.tipo_escena === "hook" ? ("Hook" as const) : ("CTA" as const),
      texto: f.texto,
      contexto: PLATAFORMA_LABEL[f.plataforma as Plataforma],
      deletedAt: f.deleted_at as string,
      restaurar: restaurarFrase,
      eliminar: eliminarFraseDefinitivo,
    })),
  ].sort((a, b) => (a.deletedAt < b.deletedAt ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <h1 className="text-h1">Papelera</h1>

      {elementos.length > 0 ? (
        <ul className="flex flex-col">
          {elementos.map((el, index) => (
            <FilaPapelera
              key={`${el.tipoBadge}-${el.id}`}
              id={el.id}
              tipoBadge={el.tipoBadge}
              texto={el.texto}
              contexto={el.contexto}
              deletedAt={el.deletedAt}
              primera={index === 0}
              restaurar={el.restaurar}
              eliminar={el.eliminar}
            />
          ))}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">La papelera está vacía.</p>
      )}
    </div>
  );
}
