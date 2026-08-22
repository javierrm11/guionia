import Link from "next/link";
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
    .order("plataforma")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <Link
        href="/configuracion/ctas/nuevo"
        className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        + Nuevo CTA
      </Link>

      {ctas && ctas.length > 0 ? (
        <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2">
          {ctas.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-secondary">
                  {PLATAFORMA_LABEL[c.plataforma as Plataforma]}
                </span>
                <form action={eliminarFrase}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="redirectTo" value={RUTA} />
                  <ConfirmButton message="¿Eliminar este CTA?" className="p-2 -m-2 text-small text-accent">
                    Eliminar
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
