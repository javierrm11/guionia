import Link from "next/link";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ConfirmButton } from "@/components/ConfirmButton";
import { eliminarFrase } from "../_shared/frasesActions";

export const dynamic = "force-dynamic";

const RUTA = "/configuracion/ctas";

export default async function CtasPage() {
  const supabase = await createClient();

  const { data: ctas } = await supabase
    .from("frases_guardadas")
    .select("*")
    .eq("tipo_escena", "cta")
    .is("deleted_at", null)
    .order("plataforma")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex justify-end">
        <Link
          href="/configuracion/ctas/nuevo"
          className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
        >
          + Añadir
        </Link>
      </div>

      {ctas && ctas.length > 0 ? (
        <ul className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2">
          {ctas.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 rounded-md bg-bg-primary p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-secondary">
                  {PLATAFORMA_LABEL[c.plataforma as Plataforma]}
                </span>
                <form action={eliminarFrase}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="redirectTo" value={RUTA} />
                  <ConfirmButton
                    message="¿Eliminar este CTA?"
                    ariaLabel="Eliminar CTA"
                    confirmLabel="Eliminar"
                    className="flex items-center justify-center rounded-sm bg-badge-danger p-2 text-white"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </ConfirmButton>
                </form>
              </div>
              <p className="text-body">{c.texto}</p>
              {c.nota && <p className="text-small text-text-secondary">{c.nota}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">Todavía no hay CTAs guardados.</p>
      )}
    </div>
  );
}
