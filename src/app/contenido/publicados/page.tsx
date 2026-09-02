import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { pad2 } from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function PublicadosPage() {
  const supabase = await createClient();

  const { data: publicados } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("estado", "publicado")
    .order("fecha_publicacion", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <Link href="/contenido/tendencias" className="self-start text-small text-accent hover:underline">
        Ver tendencias →
      </Link>

      {publicados && publicados.length > 0 ? (
        <ul className="flex flex-col">
          {publicados.map((p, index) => {
            const plataforma = p.plataforma as Plataforma;
            const Icon = PLATAFORMA_ICON[plataforma];
            const tono = PLATAFORMA_TONO[plataforma];
            const [anio, mes, dia] = (p.fecha_publicacion as string).split("-");
            const href = `/contenido/${plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${p.id}`;

            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 py-3 lg:gap-3.5 lg:py-3.5 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm lg:h-10 lg:w-10"
                  style={{ backgroundColor: tono }}
                >
                  <Icon size={16} strokeWidth={1.5} className="text-white lg:h-[18px] lg:w-[18px]" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link href={href} className="truncate text-body text-text-primary hover:underline lg:text-h3">
                    {p.titulo}
                  </Link>
                  <span className="text-caption text-text-secondary lg:text-small">
                    {PLATAFORMA_LABEL[plataforma]} · {p.fecha_publicacion}
                  </span>
                </div>
                {p.url_publicado && (
                  <a
                    href={p.url_publicado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 -m-2 text-text-secondary"
                  >
                    <ExternalLink size={16} strokeWidth={1.5} />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-small text-text-disabled">Todavía no has publicado nada.</p>
      )}
    </div>
  );
}
