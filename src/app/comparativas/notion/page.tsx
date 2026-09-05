import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";

const TITULO = "Guionia vs Notion para creadores de contenido";
const DESCRIPCION =
  "Notion es una herramienta genérica que puedes moldear para casi cualquier cosa. Guionia está hecho solo para planificar vídeos de TikTok y YouTube. Aquí la diferencia, punto por punto.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/comparativas/notion" },
  openGraph: { title: TITULO, description: DESCRIPCION },
};

const FILAS: { caracteristica: string; guionia: string; guioniaOk: boolean; notion: string; notionOk: boolean }[] = [
  {
    caracteristica: "Calendario con cadencia semanal por plataforma",
    guionia: "Incluido — defines cuánto publicas y Guionia calcula el progreso solo",
    guioniaOk: true,
    notion: "Hay que montar tú la base de datos y las fórmulas",
    notionOk: false,
  },
  {
    caracteristica: "Estructura de guion (hook / desarrollo / CTA)",
    guionia: "Plantillas por nicho listas para clonar",
    guioniaOk: true,
    notion: "Solo si construyes tu propia plantilla",
    notionOk: false,
  },
  {
    caracteristica: "Banco de hooks y CTAs reutilizables",
    guionia: "Guardas los que mejor te funcionan y los reutilizas",
    guioniaOk: true,
    notion: "Copiar y pegar entre páginas, a mano",
    notionOk: false,
  },
  {
    caracteristica: "Aviso de qué toca grabar hoy",
    guionia: "Automático, según tu cadencia y fechas",
    guioniaOk: true,
    notion: "No — tienes que revisarlo tú",
    notionOk: false,
  },
  {
    caracteristica: "Publicar directo a YouTube desde la app",
    guionia: "Sí, sin salir de Guionia",
    guioniaOk: true,
    notion: "No, hay que subirlo aparte",
    notionOk: false,
  },
  {
    caracteristica: "Seguimiento de racha de publicación",
    guionia: "Automático, semana a semana",
    guioniaOk: true,
    notion: "Manual, si te acuerdas de llevarlo",
    notionOk: false,
  },
  {
    caracteristica: "Sirve también para notas, wikis o cualquier otro proyecto",
    guionia: "No — está pensado solo para contenido de vídeo",
    guioniaOk: false,
    notion: "Sí, es de propósito general",
    notionOk: true,
  },
  {
    caracteristica: "Precio para uso individual",
    guionia: "Gratis",
    guioniaOk: true,
    notion: "Gratis, con límites en el plan personal",
    notionOk: true,
  },
];

export default function ComparativaNotionPage() {
  return (
    <div className="flex min-h-full flex-col">
      <LandingHeader />

      <main className="flex flex-1 flex-col gap-8 px-4 py-10 lg:mx-auto lg:w-full lg:max-w-3xl lg:py-16">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl leading-tight font-semibold text-text-primary lg:text-4xl">
            {TITULO}
          </h1>
          <p className="text-body text-text-secondary lg:text-h3">
            Notion es excelente para casi cualquier cosa — notas, wikis, gestión de proyectos.
            Precisamente por eso, organizar un calendario de vídeos ahí implica montar tú mismo
            todo lo que Guionia ya trae de fábrica, pensado solo para esto.
          </p>
        </div>

        <div className="flex flex-col">
          {FILAS.map((fila, index) => (
            <div
              key={fila.caracteristica}
              className={`flex flex-col gap-3 py-4 lg:grid lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center lg:gap-4 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="text-h3">{fila.caracteristica}</span>
              <span className="flex items-start gap-2 text-small text-text-secondary">
                {fila.guioniaOk ? (
                  <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <X size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
                )}
                <span>
                  <span className="text-text-primary">Guionia: </span>
                  {fila.guionia}
                </span>
              </span>
              <span className="flex items-start gap-2 text-small text-text-secondary">
                {fila.notionOk ? (
                  <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <X size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
                )}
                <span>
                  <span className="text-text-primary">Notion: </span>
                  {fila.notion}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 rounded-md border border-border p-6 text-center">
          <span className="text-h2">¿Para qué usar Notion, entonces?</span>
          <p className="max-w-md text-small text-text-secondary">
            Si además de tu contenido llevas ahí notas, documentación o proyectos que no tienen
            nada que ver con vídeo, tiene sentido seguir usándolo para eso — pero para planificar
            qué grabar cada semana, Guionia hace en un clic lo que en Notion te lleva media tarde
            de montar.
          </p>
          <Link
            href="/registro"
            className="rounded-full bg-accent px-5 py-2.5 text-body text-white active:bg-accent-hover"
          >
            Probar Guionia gratis
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
