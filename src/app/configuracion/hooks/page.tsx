import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarFrase } from "../_shared/frasesActions";

export const dynamic = "force-dynamic";

const RUTA = "/configuracion/hooks";

export default async function HooksPage() {
  const supabase = await createClient();

  const { data: hooks } = await supabase
    .from("frases_guardadas")
    .select("*")
    .eq("tipo_escena", "hook")
    .order("plataforma")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link
        href="/configuracion/hooks/nuevo"
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nuevo hook
      </Link>

      {hooks && hooks.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {hooks.map((h) => (
            <li key={h.id} className="flex flex-col gap-1 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-secondary">
                  {PLATAFORMA_LABEL[h.plataforma as Plataforma]}
                </span>
                <form action={eliminarFrase}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="redirectTo" value={RUTA} />
                  <ConfirmButton message="¿Eliminar este hook?" className="p-2 -m-2 text-small text-accent">
                    Eliminar
                  </ConfirmButton>
                </form>
              </div>
              <p className="text-body">{h.texto}</p>
              {h.nota && <p className="text-small text-text-secondary">{h.nota}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">Todavía no hay hooks guardados.</p>
      )}
    </div>
  );
}
