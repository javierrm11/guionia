import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Camera,
  FileText,
  Flame,
  Gift,
  Lightbulb,
  Link2,
  Search,
  Sparkles,
  TrendingUp,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { FaqItem } from "@/components/FaqItem";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { PasosConectados } from "@/components/PasosConectados";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { ARTICULOS } from "@/lib/blog";
import { PLATAFORMA_ICON } from "@/lib/plataformas";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Este `title` (string corto) pasa por la plantilla del layout raíz
// (`%s — Guionia`) — de ahí que no repita "Guionia" aquí.
const TITULO = "Planifica y organiza tu contenido de YouTube y TikTok";
const DESCRIPCION =
  "Organiza tus ideas, guiones y calendario de contenido para YouTube y TikTok en un solo sitio. Define tu cadencia de publicación semanal y no vuelvas a perder una idea de vídeo. Gratis.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/" },
  openGraph: {
    // openGraph.title no pasa por la plantilla del layout — va completo.
    title: `Guionia — ${TITULO}`,
    description: DESCRIPCION,
  },
};

const PASOS_EMPEZAR = [
  {
    icon: UserPlus,
    titulo: "Crea tu cuenta gratis",
    texto: "Con email o con Google, en menos de un minuto — sin tarjeta.",
  },
  {
    icon: Link2,
    titulo: "Conecta tu plataforma",
    texto: "YouTube o TikTok, sin salir de Guionia.",
  },
  {
    icon: CalendarCheck,
    titulo: "Define tu cadencia y empieza",
    texto: "Marca cuánto publicas y Guionia te dice qué toca grabar cada día.",
  },
];

const PASOS = [
  {
    icon: Lightbulb,
    titulo: "Apunta la idea al momento",
    texto:
      "Captura rápida desde cualquier pantalla, antes de que se te olvide.",
    extra: (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-caption text-text-secondary">
        <Lightbulb size={12} strokeWidth={1.5} />
        Rutina de mañana en 60 segundos
      </span>
    ),
  },
  {
    icon: CalendarDays,
    titulo: "Define tu cadencia semanal",
    texto:
      "Marca cuántas veces publicas y qué días — Guionia te dice qué toca hoy.",
    extra: (
      <div className="flex gap-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <span
            key={d + i}
            className={`flex h-6 w-6 items-center justify-center rounded-sm text-caption ${
              i === 1 || i === 3 || i === 5
                ? "bg-accent text-white"
                : "bg-neutral-bg text-text-disabled"
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    titulo: "Escribe el guion con estructura",
    texto:
      "Reutiliza tus hooks y CTAs favoritos en vez de partir de cero cada vez.",
    extra: (
      <div className="flex gap-2">
        <span className="rounded-full bg-neutral-bg px-2.5 py-1 text-caption text-text-secondary">
          Hook
        </span>
        <span className="rounded-full bg-neutral-bg px-2.5 py-1 text-caption text-text-secondary">
          CTA
        </span>
      </div>
    ),
  },
  {
    icon: UploadCloud,
    titulo: "Publica sin salir de la app",
    texto: "Sube directo a YouTube y sigue el rendimiento de tus vídeos.",
    extra: (
      <div className="flex w-full max-w-32 flex-col gap-1">
        <div className="h-1.5 w-full rounded-full bg-neutral-bg">
          <div className="h-1.5 w-2/3 rounded-full bg-accent" />
        </div>
        <span className="text-caption text-text-disabled">Subiendo… 68%</span>
      </div>
    ),
  },
];

const FAQS = [
  {
    pregunta: "¿Es gratis usar Guionia?",
    respuesta:
      "Sí, por ahora Guionia es gratis — sin límites ocultos ni tarjeta de crédito.",
  },
  {
    pregunta: "¿Qué plataformas soporta?",
    respuesta:
      "Hoy conecta con YouTube y TikTok: puedes subir vídeos y programar publicaciones directo desde Guionia.",
  },
  {
    pregunta: "¿Necesito instalar algo?",
    respuesta:
      "No. Guionia funciona en el navegador, tanto en el móvil como en el escritorio.",
  },
  {
    pregunta: "¿Está pensado para un equipo o para una persona sola?",
    respuesta:
      "Para creadores independientes que gestionan su propio contenido de principio a fin.",
  },
  {
    pregunta: "¿Mis ideas y guiones están seguros?",
    respuesta:
      "Se guardan en tu cuenta, protegidos por login, y puedes borrarlos cuando quieras.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/contenido");

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Guionia",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPCION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <LandingHeader />

      <section
        className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden px-4 py-16 lg:px-10"
        style={{
          backgroundImage:
            "radial-gradient(120% 120% at 15% 10%, #9084F2 0%, var(--accent) 45%, #423384 100%)",
        }}
      >
        {/* Brillos decorativos — puramente estéticos, recortados por el propio `overflow-hidden` de la sección. */}
        <span className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl lg:h-80 lg:w-80" />
        <span className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-10 lg:mx-auto lg:w-full lg:max-w-6xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="animate-tarjeta-entrada inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-caption text-white">
              <Sparkles size={12} strokeWidth={1.5} />
              Para creadores de YouTube y TikTok
            </span>
            <h1
              className="animate-tarjeta-entrada font-display text-3xl leading-tight font-semibold text-white lg:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              Deja de perder ideas de vídeo entre notas sueltas
            </h1>
            <p
              className="animate-tarjeta-entrada max-w-xl text-body text-white/80 lg:text-h3"
              style={{ animationDelay: "160ms" }}
            >
              Guionia centraliza tus ideas, guiones y calendario de publicación
              para YouTube y TikTok — para que sepas siempre qué toca grabar
              hoy.
            </p>
            <div
              className="animate-tarjeta-entrada flex flex-col items-center gap-1.5 lg:items-start"
              style={{ animationDelay: "220ms" }}
            >
              <Link
                href="/registro"
                className="animate-cta-brillo rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-lg active:bg-neutral-bg"
              >
                Crear cuenta gratis
              </Link>
              <span className="text-caption text-white/70">
                Gratis, sin tarjeta.
              </span>
              <span className="text-caption text-white/70">
                Construido por un creador, para creadores.
              </span>
            </div>
          </div>

          {/* Mockup ilustrativo del dashboard "Control" — datos de ejemplo, no en vivo.
              Padding vertical en el propio contenedor (no negativo sobre las tarjetas
              flotantes) para que estas tengan sitio de sobra donde flotar sin tapar
              contenido real del mockup, que va borde a borde. */}
          <div className="relative w-full lg:py-8">
            <div
              className="w-full overflow-hidden rounded-md border border-border"
              style={{ boxShadow: "0 24px 48px rgba(16,24,40,0.35)" }}
            >
              <div className="flex items-center gap-2 border-b border-border bg-bg-page px-4 py-2.5">
                <div className="flex flex-1 items-center gap-2 rounded-full bg-neutral-bg px-3 py-1.5">
                  <Search
                    size={13}
                    strokeWidth={1.5}
                    className="shrink-0 text-text-disabled"
                  />
                  <span className="text-caption text-text-disabled">
                    Buscar por título o etiqueta…
                  </span>
                </div>
                <TrendingUp
                  size={16}
                  strokeWidth={1.5}
                  className="shrink-0 text-text-secondary"
                />
              </div>
              <div className="flex flex-col gap-4 p-5">
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
                    boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
                  }}
                >
                  <Flame size={12} strokeWidth={0} fill="#FFFFFF" />6 semanas
                  seguidas
                </span>

                <div className="flex flex-col gap-1.5">
                  <span className="text-caption text-text-secondary">
                    Cadencia semanal
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-neutral-bg">
                    <div className="h-1.5 w-3/4 rounded-full bg-accent" />
                  </div>
                  <span className="text-caption text-text-disabled">
                    3 de 4 esta semana
                  </span>
                </div>

                <div className="flex items-center gap-3.5 rounded-md bg-bg-primary p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-danger">
                    <PLATAFORMA_ICON.youtube
                      size={20}
                      strokeWidth={1.5}
                      className="text-white"
                    />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <span className="text-caption font-semibold text-accent">
                      Toca grabar
                    </span>
                    <p className="truncate text-h2">
                      5 hábitos que cambiaron mi rutina
                    </p>
                  </div>
                </div>

                <div className="flex flex-col">
                  {[
                    {
                      titulo: "Reacciono a mi primer vídeo",
                      plataforma: "tiktok" as const,
                      tone: "warning" as const,
                      label: "Grabado",
                    },
                    {
                      titulo: "Rutina de mañana en 60 segundos",
                      plataforma: "tiktok" as const,
                      tone: "neutral" as const,
                      label: "Idea",
                    },
                  ].map((t, i) => (
                    <div
                      key={t.titulo}
                      className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
                        style={{
                          backgroundColor: PLATAFORMA_TONO[t.plataforma],
                        }}
                      >
                        <PLATAFORMA_ICON.tiktok
                          size={16}
                          strokeWidth={1.5}
                          className="text-white"
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body text-left">
                        {t.titulo}
                      </span>
                      <Badge tone={t.tone}>{t.label}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tarjetas flotantes, estilo "stat card" — solo en escritorio.
                Ancladas a los huecos verticales del `lg:py-8` del contenedor
                (no superpuestas sobre el propio mockup, que va borde a
                borde) — solo un ligero solape horizontal hacia fuera. */}
            <div className="absolute bottom-0 -left-4 hidden items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl lg:flex">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bg">
                <Flame size={16} strokeWidth={1.5} className="text-accent" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-h3 text-text-primary">
                  6 semanas
                </span>
                <span className="text-caption text-text-secondary">
                  seguidas publicando
                </span>
              </div>
            </div>

            <div className="absolute top-0 -right-4 hidden items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl lg:flex">
              <div className="flex -space-x-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                  style={{ backgroundColor: PLATAFORMA_TONO.tiktok }}
                >
                  <PLATAFORMA_ICON.tiktok
                    size={13}
                    strokeWidth={1.5}
                    className="text-white"
                  />
                </span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                  style={{ backgroundColor: PLATAFORMA_TONO.youtube }}
                >
                  <PLATAFORMA_ICON.youtube
                    size={13}
                    strokeWidth={1.5}
                    className="text-white"
                  />
                </span>
              </div>
              <span className="max-w-24 text-caption text-text-secondary">
                Conecta tus plataformas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* "Conecta tus cuentas" y "Cómo funciona" van juntas, lado a lado —
          primero la prueba rápida de compatibilidad, luego el porqué —
          antes que "Cómo empezar": primero se entiende el producto, luego
          se pide la acción de arrancar. Fondo blanco, sin tinte. */}
      <section className="border-t border-border px-4 py-14 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="text-caption text-text-secondary lg:text-body">
              Conecta tus cuentas
            </span>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-sm lg:h-16 lg:w-16"
                  style={{ backgroundColor: PLATAFORMA_TONO.youtube }}
                >
                  <PLATAFORMA_ICON.youtube
                    size={22}
                    strokeWidth={1.5}
                    className="text-white lg:h-7 lg:w-7"
                  />
                </span>
                <span className="text-caption text-text-secondary lg:text-body">
                  YouTube
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-sm lg:h-16 lg:w-16"
                  style={{ backgroundColor: PLATAFORMA_TONO.tiktok }}
                >
                  <PLATAFORMA_ICON.tiktok
                    size={22}
                    strokeWidth={1.5}
                    className="text-white lg:h-7 lg:w-7"
                  />
                </span>
                <span className="text-caption text-text-secondary lg:text-body">
                  TikTok
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-50 lg:gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-neutral lg:h-16 lg:w-16">
                  <Camera
                    size={22}
                    strokeWidth={1.5}
                    className="text-white lg:h-7 lg:w-7"
                  />
                </span>
                <span className="text-caption text-text-disabled lg:text-body">
                  Próximamente
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="font-display text-h1">Cómo funciona</h2>
            <div className="flex flex-col gap-6">
              {PASOS.map(({ icon: Icon, titulo, texto, extra }) => (
                <div key={titulo} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Icon size={20} strokeWidth={1.5} className="text-white" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-h3">{titulo}</span>
                    <p className="text-small text-text-secondary">{texto}</p>
                    {extra}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-14 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <h2 className="font-display text-h1">Cómo empezar</h2>
          <PasosConectados pasos={PASOS_EMPEZAR} columnasDesktop={3} />
        </div>
      </section>

      <section className="border-t border-border bg-neutral-bg px-4 py-14 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-h1">
              Aprende a organizarte mejor
            </h2>
            <Link
              href="/blog"
              className="flex shrink-0 items-center gap-1 text-caption text-text-secondary lg:text-body"
            >
              Ver el blog
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            {ARTICULOS.map((articulo) => (
              <Link
                key={articulo.slug}
                href={`/blog/${articulo.slug}`}
                className="flex flex-col gap-2 rounded-2xl bg-bg-primary p-5 hover:opacity-70"
              >
                <span className="text-h3">{articulo.titulo}</span>
                <p className="text-small text-text-secondary">
                  {articulo.descripcion}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Único sitio, aparte del hero y el CTA final, con un tinte de marca
          (`--accent-bg`) en vez de gris — refuerza el morado a mitad de página. */}
      <section className="border-t border-border bg-accent-bg px-4 py-14 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
            <ArrowLeftRight
              size={20}
              strokeWidth={1.5}
              className="text-white"
            />
          </span>
          <h2 className="font-display text-h1">
            ¿Vienes de Notion o de una hoja de cálculo?
          </h2>
          <p className="max-w-xl text-body text-text-secondary">
            Mira en qué se diferencia organizar tu contenido en Guionia frente a
            una herramienta genérica.
          </p>
          <Link
            href="/comparativas/notion"
            className="rounded-full bg-accent px-5 py-2.5 text-body text-white active:bg-accent-hover"
          >
            Ver Guionia vs Notion
          </Link>
        </div>
      </section>

      <section className="border-t border-border px-4 py-14 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 lg:gap-5">
          <h2 className="pb-2 text-center font-display text-h1">
            Preguntas frecuentes
          </h2>
          {FAQS.map((f) => (
            <FaqItem
              key={f.pregunta}
              pregunta={f.pregunta}
              respuesta={f.respuesta}
            />
          ))}
        </div>
      </section>

      {/* Referidos baja hasta pegado al CTA final: a quien todavía no se ha
          registrado no le interesa invitar a nadie — es un feature para
          quien ya es usuario, no un argumento para decidirse. */}
      <section className="border-t border-border bg-neutral-bg px-4 py-14 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-bg">
            <Gift size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <h2 className="font-display text-h1">Invita a otros creadores</h2>
          <p className="max-w-xl text-body text-text-secondary">
            En cuanto creas tu cuenta, tienes tu propio enlace para invitar a
            otros creadores a organizarse con Guionia.
          </p>
          <Link
            href="/registro"
            className="rounded-full bg-accent px-5 py-2.5 text-body text-white active:bg-accent-hover"
          >
            Crear cuenta y conseguir tu enlace
          </Link>
        </div>
      </section>

      <section
        className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-4 pt-20 pb-24 text-center"
        style={{ backgroundColor: "var(--ai)" }}
      >
        {/* Mismos brillos decorativos que el hero — solo aparecen en estos
            dos sitios, los únicos con un fondo de color sólido y atrevido. */}
        <span className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <h2 className="relative font-display text-h1 text-white">
          Empieza a organizar tu contenido hoy
        </h2>
        <Link
          href="/registro"
          className="animate-cta-brillo relative rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-lg active:bg-neutral-bg"
        >
          Crear cuenta gratis
        </Link>
        {/* Ola en el borde inferior — transición hacia el footer blanco. */}
        <svg
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-10 w-full"
        >
          <path
            d="M0,16 C100,40 300,-8 400,16 L400,40 L0,40 Z"
            fill="var(--bg-page)"
          />
        </svg>
      </section>

      <LandingFooter />
    </div>
  );
}
