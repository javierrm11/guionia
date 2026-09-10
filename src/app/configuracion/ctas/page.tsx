import Link from "next/link";
import { Eye, Trash2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { ConfirmButton } from "@/components/ConfirmButton";
import { obtenerRendimientoFrases } from "@/lib/youtube/rendimientoFrases";
import { eliminarFrase } from "../_shared/frasesActions";

export const dynamic = "force-dynamic";

const RUTA = "/configuracion/ctas";

export default async function CtasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: ctas }, rendimiento] = await Promise.all([
    supabase
      .from("frases_guardadas")
      .select("*")
      .eq("tipo_escena", "cta")
      .is("deleted_at", null)
      .order("plataforma")
      .order("created_at", { ascending: false }),
    user ? obtenerRendimientoFrases(supabase, user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-8">
      <div className="flex justify-end">
        <Link
          href="/configuracion/ctas/nuevo"
          className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover lg:px-4 lg:py-2 lg:text-body"
        >
          + Añadir
        </Link>
      </div>

      {ctas && ctas.length > 0 ? (
        <ul className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
          {ctas.map((c, index) => (
            <li
              key={c.id}
              className={`flex flex-col gap-1 py-3.5 lg:py-4 ${
                index > 0 ? "border-t border-border lg:border-t-0" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-secondary lg:text-small">
                  {PLATAFORMA_LABEL[c.plataforma as Plataforma]}
                </span>
                {c.es_plantilla_sistema ? (
                  <span className="text-caption text-text-disabled rounded-full bg-neutral-bg px-2 py-0.5">
                    Plantilla
                  </span>
                ) : (
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
                )}
              </div>
              <p className="text-body lg:text-h3">{c.texto}</p>
              {c.nota && (
                <p className="text-small text-text-secondary">{c.nota}</p>
              )}
              {rendimiento?.get(c.id) && (
                <span className="flex items-center gap-2.5 text-caption text-text-secondary">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} strokeWidth={1.5} />
                    {rendimiento.get(c.id)!.usos}{" "}
                    {rendimiento.get(c.id)!.usos === 1 ? "vídeo" : "vídeos"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} strokeWidth={1.5} />
                    {Math.round(
                      rendimiento.get(c.id)!.vistasMedia,
                    ).toLocaleString("es-ES")}{" "}
                    vistas de media
                  </span>
                  <span>
                    {Math.round(rendimiento.get(c.id)!.retencionMedia)}%
                    retención media
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">
          Todavía no hay CTAs guardados.
        </p>
      )}
    </div>
  );
}
