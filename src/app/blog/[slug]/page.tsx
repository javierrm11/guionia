import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { ARTICULOS, getArticulo } from "@/lib/blog";

export function generateStaticParams() {
  return ARTICULOS.map((articulo) => ({ slug: articulo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const articulo = getArticulo(slug);
  if (!articulo) return {};

  return {
    title: articulo.titulo,
    description: articulo.descripcion,
    alternates: { canonical: `/blog/${articulo.slug}` },
    openGraph: {
      title: `Guionia — ${articulo.titulo}`,
      description: articulo.descripcion,
      type: "article",
      publishedTime: articulo.fechaPublicacion,
    },
  };
}

function formatearFecha(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articulo = getArticulo(slug);
  if (!articulo) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articulo.titulo,
    description: articulo.descripcion,
    datePublished: articulo.fechaPublicacion,
  };

  return (
    <div className="flex min-h-full flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />

      <main className="flex flex-1 flex-col gap-6 px-4 py-10 lg:mx-auto lg:w-full lg:max-w-2xl lg:py-16">
        <Link
          href="/blog"
          className="flex w-fit items-center gap-1.5 text-caption text-text-secondary"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Blog
        </Link>

        <div className="flex flex-col gap-2">
          <span className="text-caption text-text-disabled">
            {formatearFecha(articulo.fechaPublicacion)}
          </span>
          <h1 className="font-display text-3xl leading-tight font-semibold text-text-primary lg:text-4xl">
            {articulo.titulo}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {articulo.cuerpo.map((bloque, index) => {
            if (bloque.tipo === "h2") {
              return (
                <h2 key={index} className="pt-2 text-h1">
                  {bloque.texto}
                </h2>
              );
            }
            if (bloque.tipo === "ul") {
              return (
                <ul key={index} className="flex list-disc flex-col gap-2 pl-5">
                  {bloque.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-body text-text-secondary lg:text-h3">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-body text-text-secondary lg:text-h3">
                {bloque.texto}
              </p>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 rounded-md border border-border p-6 text-center">
          <span className="text-h2">¿Listo para organizar tu contenido?</span>
          <p className="text-small text-text-secondary">
            Ideas, guiones y calendario de TikTok y YouTube en un solo sitio.
          </p>
          <Link
            href="/registro"
            className="rounded-full bg-accent px-5 py-2.5 text-body text-white active:bg-accent-hover"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
