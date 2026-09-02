import Link from "next/link";
import { Trash2 } from "lucide-react";
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
    .is("deleted_at", null)
    .order("plataforma")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex justify-end">
        <Link
          href="/configuracion/hooks/nuevo"
          className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover lg:px-4 lg:py-2 lg:text-body"
        >
          + Añadir
        </Link>
      </div>

      {hooks && hooks.length > 0 ? (
        <ul className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
          {hooks.map((h, index) => (
            <li
              key={h.id}
              className={`flex flex-col gap-1 py-3.5 lg:py-4 ${
                index > 0 ? "border-t border-border lg:border-t-0" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-secondary lg:text-small">
                  {PLATAFORMA_LABEL[h.plataforma as Plataforma]}
                </span>
                <form action={eliminarFrase}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="redirectTo" value={RUTA} />
                  <ConfirmButton
                    message="¿Eliminar este hook?"
                    ariaLabel="Eliminar hook"
                    confirmLabel="Eliminar"
                    className="flex items-center justify-center rounded-sm bg-badge-danger p-2 text-white"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </ConfirmButton>
                </form>
              </div>
              <p className="text-body lg:text-h3">{h.texto}</p>
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
