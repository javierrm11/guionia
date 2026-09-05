import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { ARTICULOS } from "@/lib/blog";

const TITULO = "Blog";
const DESCRIPCION =
  "Guías prácticas sobre planificación de contenido, guiones y constancia al publicar en TikTok y YouTube.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/blog" },
  openGraph: { title: `Guionia — ${TITULO}`, description: DESCRIPCION },
};

function formatearFecha(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  return (
    <div className="flex min-h-full flex-col">
      <LandingHeader />

      <main className="flex flex-1 flex-col gap-8 px-4 py-10 lg:mx-auto lg:w-full lg:max-w-3xl lg:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl leading-tight font-semibold text-text-primary lg:text-4xl">
            Blog de Guionia
          </h1>
          <p className="text-body text-text-secondary lg:text-h3">{DESCRIPCION}</p>
        </div>

        <div className="flex flex-col">
          {ARTICULOS.map((articulo, index) => (
            <Link
              key={articulo.slug}
              href={`/blog/${articulo.slug}`}
              className={`flex flex-col gap-2 py-6 hover:opacity-70 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <span className="text-caption text-text-disabled">
                {formatearFecha(articulo.fechaPublicacion)}
              </span>
              <span className="text-h2 lg:text-h1">{articulo.titulo}</span>
              <span className="text-body text-text-secondary lg:text-h3">
                {articulo.descripcion}
              </span>
              <span className="flex items-center gap-1 text-caption font-semibold text-accent">
                Leer artículo
                <ArrowRight size={14} strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
