import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
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
        <ul className="flex flex-col gap-2">
          {publicados.map((p) => {
            const [anio, mes, dia] = (p.fecha_publicacion as string).split("-");
            const href = `/contenido/${p.plataforma}/videos/${anio}/${pad2(Number(mes))}/${pad2(Number(dia))}/${p.id}`;

            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-3"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Link href={href} className="truncate text-accent hover:underline">
                    {p.titulo}
                  </Link>
                  <span className="text-caption text-text-secondary">
                    {PLATAFORMA_LABEL[p.plataforma as Plataforma]} · {p.fecha_publicacion}
                  </span>
                </div>
                {p.url_publicado && (
                  <a
                    href={p.url_publicado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-text-secondary"
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
