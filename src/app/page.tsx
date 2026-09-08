import type { Metadata } from "next";
import { Anton } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CalendarX2,
  Camera,
  Check,
  FileText,
  Flame,
  Gift,
  Layers,
  Lightbulb,
  Link2,
  RefreshCw,
  Search,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { BarraProgresoScroll } from "@/components/BarraProgresoScroll";
import { BotonVolverArriba } from "@/components/BotonVolverArriba";
import { CtaFlotanteLanding } from "@/components/CtaFlotanteLanding";
import { FaqItem } from "@/components/FaqItem";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PasosConectados } from "@/components/PasosConectados";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { ARTICULOS } from "@/lib/blog";
import { PLATAFORMA_ICON } from "@/lib/plataformas";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Fuente de titulares solo para la landing (no toca `--font-display` global,
 *  que sigue siendo Space Grotesk en el resto de la app) — se sobreescribe
 *  la variable CSS en el contenedor raíz de esta página (ver `return` más
 *  abajo), así que cualquier `font-display` que ya usaba el marcado (h1 del
 *  hero, "Cómo funciona"...) la hereda sin tocar una por una. Condensada y
 *  muy pesada — pensada para mayúsculas cortas, así que los textos largos en
 *  minúscula que ya usaban `font-display` (p. ej. el H1 del hero) se leen
 *  más apretados que antes; si no convence, es solo cambiar esta fuente. */
const anton = Anton({
  variable: "--font-landing-display",
  subsets: ["latin"],
  weight: "400",
});

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

const PROBLEMAS = [
  {
    icon: StickyNote,
    titulo: "Las ideas se pierden entre notas sueltas",
    texto:
      "Apuntas una en el móvil, otra en WhatsApp, otra en la cabeza — y para cuando te sientas a grabar ya no te acuerdas de la mitad.",
  },
  {
    icon: CalendarX2,
    titulo: "Publicas cuando te acuerdas, no cuando toca",
    texto:
      "Sin una cadencia clara, unas semanas subes tres vídeos y otras ninguno — y la constancia es justo lo que hace crecer un canal.",
  },
  {
    icon: RefreshCw,
    titulo: "Cada guion empieza de cero",
    texto:
      "Sin un sitio donde guardar los hooks y CTAs que ya sabes que funcionan, acabas reescribiendo lo mismo una y otra vez.",
  },
];

/** Mockups ilustrativos — datos de ejemplo, no en vivo. Distintos entre sí a
 *  propósito (barra de progreso, lista de escenas, calendario, gráfico) para
 *  que "Todo lo que necesitas" no repita el mismo bloque icono+tarjeta
 *  cuatro veces seguidas — ver layout alterno en el `return`. */
const FUNCIONALIDADES = [
  {
    icon: Target,
    titulo: "Cadencia semanal de verdad",
    texto:
      "Marca cuántos vídeos publicas por semana y en qué plataforma — Guionia calcula tu progreso real y cuenta las semanas seguidas que llevas cumpliendo, no solo un calendario bonito.",
    mockup: (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-primary p-6 shadow-sm">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
            boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
          }}
        >
          <Flame size={12} strokeWidth={0} fill="#FFFFFF" />6 semanas seguidas
        </span>
        <div className="flex gap-1.5">
          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
            <span
              key={d + i}
              className={`flex h-8 w-8 flex-1 items-center justify-center rounded-sm text-caption ${
                i < 4
                  ? "bg-accent text-white"
                  : "bg-neutral-bg text-text-disabled"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full rounded-full bg-neutral-bg">
            <div className="h-1.5 w-3/4 rounded-full bg-accent" />
          </div>
          <span className="text-caption text-text-disabled">
            3 de 4 esta semana
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    titulo: "Guiones con estructura reutilizable",
    texto:
      "Guarda tus hooks y CTAs favoritos y reutilízalos en el siguiente guion — cada escena queda organizada, con historial de versiones si cambias de opinión.",
    mockup: (
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-primary p-6 shadow-sm">
        {[
          { label: "Hook", tono: "var(--accent)", ancho: "w-4/5" },
          { label: "Desarrollo", tono: "var(--neutral)", ancho: "w-full" },
          { label: "CTA", tono: "var(--ai)", ancho: "w-2/3" },
        ].map(({ label, tono, ancho }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-md bg-neutral-bg p-3"
          >
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-caption font-semibold text-white"
              style={{ backgroundColor: tono }}
            >
              {label}
            </span>
            <span className={`h-2 rounded-full bg-border ${ancho}`} />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: CalendarDays,
    titulo: "Calendario editorial por plataforma",
    texto:
      "Ve de un vistazo qué toca grabar, editar o publicar cada día, cruzado con tu plantilla semanal — sin depender de una hoja de cálculo aparte.",
    mockup: (
      <div className="rounded-2xl border border-border bg-bg-primary p-6 shadow-sm">
        <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-caption text-text-disabled">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => {
            const marcado = [1, 3, 4, 8, 10, 11].includes(i);
            const plataforma = i % 3 === 0 ? "tiktok" : "youtube";
            const Icon = PLATAFORMA_ICON[plataforma];
            return (
              <div
                key={i}
                className="flex h-9 items-center justify-center rounded-sm"
                style={{
                  backgroundColor: marcado
                    ? PLATAFORMA_TONO[plataforma]
                    : "var(--neutral-bg)",
                }}
              >
                {marcado && (
                  <Icon size={12} strokeWidth={1.5} className="text-white" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    titulo: "Estadísticas sin cambiar de pestaña",
    texto:
      "Vistas, retención y tus mejores vídeos de YouTube y TikTok, directamente en Guionia — sin entrar plataforma por plataforma a comprobar cómo va todo.",
    mockup: (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-primary p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-md bg-neutral-bg p-3">
            <span className="text-caption text-text-secondary">Vistas</span>
            <span className="text-h2">12,4K</span>
            <span className="text-caption text-success">↑ 18%</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md bg-neutral-bg p-3">
            <span className="text-caption text-text-secondary">Retención</span>
            <span className="text-h2">61%</span>
            <span className="text-caption text-success">↑ 4%</span>
          </div>
        </div>
        <div className="flex h-16 items-end gap-1.5">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-accent"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

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

const OBJECIONES = [
  {
    pregunta: "¿Y si ya uso Notion o una hoja de cálculo?",
    respuesta:
      "Puedes seguir usándola para otras cosas — Guionia se centra solo en ideas, guiones y calendario de vídeo, sin obligarte a migrar nada más.",
  },
  {
    pregunta: "¿Y si dejo de usarlo al mes?",
    respuesta:
      "Tus ideas y guiones son tuyos: puedes exportarlos o borrarlos cuando quieras, sin permanencia ni letra pequeña.",
  },
  {
    pregunta: "¿Hace falta saber de tecnología?",
    respuesta:
      "No. Si sabes usar WhatsApp o las Notas del móvil, sabes usar Guionia — funciona en el navegador, sin instalar nada.",
  },
];

const INCLUIDO_GRATIS = [
  "Ideas, guiones y calendario ilimitados",
  "YouTube y TikTok conectados",
  "Cadencia semanal, racha y estadísticas",
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

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Guionia",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/logo/logo.jpg`,
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
    <div
      className={`${anton.variable} relative flex flex-1 flex-col`}
      style={
        {
          // Tailwind resuelve `--font-display` en tiempo de build y deja
          // escrito directamente `var(--font-space-grotesk)` dentro de la
          // clase `.font-display` (así compila `@theme inline`) — sobreescribir
          // `--font-display` aquí no serviría de nada porque esa variable ya
          // no aparece en el CSS compilado. Hay que apuntar a la variable real
          // que sí queda en el CSS: `--font-space-grotesk`.
          "--font-space-grotesk":
            "var(--font-landing-display), var(--font-inter), -apple-system, sans-serif",
        } as React.CSSProperties
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <BarraProgresoScroll />
      <LandingHeader />

      <section className="relative flex min-h-screen w-full flex-col overflow-hidden px-4 pt-28 pb-10 lg:px-10 lg:pt-16 lg:pb-10">
        {/* Foto de fondo, oscurecida, detrás del degradado morado — el
            degradado se queda con opacidad reducida encima para dar la
            identidad de color sin tapar del todo la foto, y una capa negra
            aparte se encarga de oscurecerla para que el texto blanco siga
            leyéndose bien encima de cualquier zona de la imagen. */}
        <Image
          src="/fotos/foto4.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 15% 10%, #9084F2 0%, var(--accent) 45%, #423384 100%)",
            opacity: 0.8,
          }}
        />
        <div className="absolute inset-0 bg-black/35" />

        {/* Brillos decorativos — puramente estéticos, recortados por el propio `overflow-hidden` de la sección. */}
        <span className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl lg:h-80 lg:w-80" />
        <span className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="flex flex-col items-center gap-10 lg:mx-auto lg:w-full lg:max-w-6xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <span className="animate-tarjeta-entrada inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-caption text-white">
                <Sparkles size={12} strokeWidth={1.5} />
                Para creadores de YouTube y TikTok
              </span>
              <h1
                className="animate-tarjeta-entrada font-display text-3xl leading-tight text-white uppercase text-balance lg:text-5xl lg:text-wrap"
                style={{ animationDelay: "80ms" }}
              >
                Deja de perder ideas de vídeo entre notas sueltas
              </h1>
              <p
                className="animate-tarjeta-entrada max-w-xl text-body text-white/80 lg:text-h3"
                style={{ animationDelay: "160ms" }}
              >
                Guionia centraliza tus ideas, guiones y calendario de
                publicación para YouTube y TikTok — para que sepas siempre qué
                toca grabar hoy.
              </p>
              <div
                className="animate-tarjeta-entrada flex flex-col items-center gap-1.5 lg:items-start"
                style={{ animationDelay: "220ms" }}
              >
                <Link
                  href="/registro"
                  className="group animate-cta-brillo flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-lg active:bg-neutral-bg"
                >
                  Crear cuenta gratis
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <span className="text-caption text-white/70">
                  Gratis, sin tarjeta.
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
                <div className="flex items-center gap-2 border-b bg-white border-border px-4 py-2.5">
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
                <div className="relative overflow-hidden bg-white">
                  <div className="pointer-events-none absolute inset-x-0 top-0">
                    <OndaCadencia
                      porcentaje={0}
                      alturaFija={210}
                      color="var(--accent)"
                    />
                  </div>

                  <div className="relative flex flex-col gap-4 p-5">
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
                        boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
                      }}
                    >
                      <Flame size={12} strokeWidth={0} fill="#FFFFFF" />6
                      semanas seguidas
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-caption text-white/80">
                        Cadencia semanal
                      </span>
                      <div className="h-1.5 w-full rounded-full bg-white/25">
                        <div className="h-1.5 w-3/4 rounded-full bg-white" />
                      </div>
                      <span className="text-caption text-white/80">
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
                  <span className="font-display text-h3 text-text-primary uppercase font-normal!">
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
        </div>

        {/* "Conecta tus cuentas" — vive aquí, en el hueco que dejaba el hero
            por debajo del contenido principal (`min-h-screen` con el bloque
            de arriba centrado), en vez de como sección aparte más abajo. */}
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 border-t border-white/15 pt-8 lg:flex-row lg:justify-center lg:gap-12">
          <span className="text-caption text-white/70 uppercase">
            Conecta tus cuentas
          </span>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-sm"
                style={{ backgroundColor: PLATAFORMA_TONO.youtube }}
              >
                <PLATAFORMA_ICON.youtube
                  size={18}
                  strokeWidth={1.5}
                  className="text-white"
                />
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-sm"
                style={{ backgroundColor: PLATAFORMA_TONO.tiktok }}
              >
                <PLATAFORMA_ICON.tiktok
                  size={18}
                  strokeWidth={1.5}
                  className="text-white"
                />
              </span>
            </div>
            <div className="flex items-center gap-2.5 opacity-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/20">
                <Camera size={18} strokeWidth={1.5} className="text-white" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* "Conecta tus cuentas" ya vive en el hueco del hero, justo encima.
          Antes de explicar cómo funciona, se agita el problema real — más
          fácil enganchar cuando el visitante se ve reflejado en el dolor
          antes de ver la solución. Fondo blanco, sin tinte. */}
      {/* Notas desordenadas y ligeramente rotadas, apiladas en vertical y
          superpuestas en escritorio — la propia estructura (caos, no rejilla
          ordenada) representa el problema del que habla el texto: ideas
          sueltas sin un sitio fijo. Se endereza al pasar el ratón
          (`hover:rotate-0`), como si la "recogieras". En móvil se apilan sin
          solape (los márgenes negativos son `lg:`) para no perder
          legibilidad. Foto a la derecha, solo en escritorio (`hidden
          lg:block`) — en móvil no hay sitio de sobra junto al montón de
          notas. */}
      <section className="border-t border-border px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col items-center gap-8 lg:items-start">
            <h2 className="text-center font-display text-h1 text-3xl! uppercase font-normal! lg:text-left lg:text-5xl!">
              ¿Te suena esto?
            </h2>
            <div className="flex w-full flex-col items-center gap-6 lg:items-start lg:gap-0">
              {PROBLEMAS.map(({ icon: Icon, titulo, texto }, i) => {
                const rotacion = ["-rotate-3", "rotate-2", "-rotate-1"][i];
                const fondo = [
                  "bg-warning-bg",
                  "bg-accent-bg",
                  "bg-neutral-bg",
                ][i];
                const zBase = ["z-0", "z-10", "z-20"][i];
                const desplazamiento = [
                  "",
                  "lg:-mt-4 lg:ml-10",
                  "lg:-mt-4 lg:ml-4",
                ][i];

                return (
                  <div
                    key={titulo}
                    className={`flex w-full max-w-72 flex-col gap-2.5 rounded-lg p-5 shadow-md transition-transform duration-300 hover:z-30 hover:rotate-0 hover:scale-105 ${rotacion} ${fondo} ${zBase} ${desplazamiento}`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="text-text-secondary"
                    />
                    <h3 className="text-h3">{titulo}</h3>
                    <p className="text-small text-text-secondary">{texto}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative hidden aspect-4/5 w-full overflow-hidden rounded-2xl shadow-md lg:block">
            <Image
              src="/fotos/foto1.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className=" px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-20">
          <h2 className="text-center font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            Cómo <span className="text-accent">funciona</span>
          </h2>
          <PasosConectados pasos={PASOS} columnasDesktop={4} destacado />
        </div>
      </section>

      {/* Bloques con más texto real (no solo iconos) que "Cómo funciona" —
          es la sección con más contenido indexable de toda la landing.
          Layout alterno (mockup a un lado, texto al otro, cambiando de lado
          en cada bloque vía `lg:order-*`) en vez de una rejilla de tarjetas
          idénticas — cada mockup es distinto (barra de progreso, lista de
          escenas, calendario, gráfico), así que no se repite el mismo
          patrón icono+tarjeta cuatro veces seguidas. */}
      <section className="border-t border-border bg-neutral-bg px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:gap-24">
          <h2 className="text-center font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            Todo lo que <span className="text-accent">necesitas</span>
          </h2>
          <div className="flex flex-col gap-16 lg:gap-24">
            {FUNCIONALIDADES.map(({ icon: Icon, titulo, texto, mockup }, i) => (
              <div
                key={titulo}
                className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>{mockup}</div>
                <div
                  className={`flex flex-col items-center gap-3 text-center lg:items-start lg:text-left ${
                    i % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent shadow-md">
                    <Icon size={22} strokeWidth={1.5} className="text-white" />
                  </span>
                  <h3 className="text-h2">{titulo}</h3>
                  <p className="text-body text-text-secondary">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mismo tratamiento que el hero: foto de fondo + morado encima +
          negro para oscurecer, así el texto blanco siempre contrasta bien —
          reutiliza `foto4.jpg`, ya usada en el hero, para que las dos
          secciones con foto+morado "se contesten" visualmente. Los pasos se
          quedan en tarjetas blancas (`enTarjeta`), así que no hace falta
          tocar `PasosConectados` para que contrasten. */}
      <section className="relative overflow-hidden px-4 py-16 lg:px-8">
        <Image src="/fotos/foto4.jpg" alt="" fill className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "var(--accent)", opacity: 0.75 }}
        />
        <div className="absolute inset-0 bg-black/45" />

        <span className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <span className="pointer-events-none absolute -right-10 -bottom-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-display text-h1 text-3xl! text-white uppercase font-normal! lg:text-5xl!">
              Cómo empezar
            </h2>
            <p className="text-body text-white/80">
              Menos de 2 minutos, sin tarjeta de crédito.
            </p>
          </div>
          <PasosConectados
            pasos={PASOS_EMPEZAR}
            columnasDesktop={3}
            destacado
            enTarjeta
          />
          <Link
            href="/registro"
            className="rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Foto reutilizada (foto1.jpg) a modo de "avatar" del creador —
          solo hay 2 fotos disponibles en el proyecto, así que se repite;
          si en algún momento hay una foto real del creador, sustituir
          aquí primero. */}
      <section className="border-t border-border px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-md">
            <Image
              src="/fotos/foto1.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <h2 className="font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            Por qué <span className="text-accent">Guionia</span>
          </h2>
          <p className="text-body text-text-secondary">
            Empecé a construir Guionia porque a mí mismo se me perdían ideas de
            vídeo entre notas de voz, WhatsApp y post-its — y publicaba cuando
            me acordaba, no cuando tocaba. Lo hice para organizarme yo, y lo
            comparto por si a ti te pasa lo mismo.
          </p>
        </div>
      </section>

      <section
        className="border-t border-border px-4 py-16 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(108,92,224,0.35), var(--bg-page) 65%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent shadow-md">
            <ArrowLeftRight
              size={20}
              strokeWidth={1.5}
              className="text-white"
            />
          </span>
          <h2 className="font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            ¿Vienes de Notion o de una hoja de cálculo?
          </h2>
          <p className="max-w-xl text-body text-text-secondary">
            Mira en qué se diferencia organizar tu contenido en Guionia frente a
            una herramienta genérica.
          </p>
          <Link
            href="/comparativas/notion"
            className="group flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-body text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg active:translate-y-0"
          >
            Ver Guionia vs Notion
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-accent p-8 shadow-md">
            <div className="flex items-baseline gap-3">
              <span className="text-body text-white/60 line-through">
                9,99€/mes
              </span>
              <span className="font-display text-5xl! text-white uppercase font-normal!">
                Gratis
              </span>
            </div>
            <p className="text-body text-white/80">
              Por ahora, sin límites ocultos ni tarjeta de crédito.
            </p>
            <ul className="flex flex-col gap-2 self-start text-left text-body text-white/90">
              {INCLUIDO_GRATIS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-white"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/registro"
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-md active:bg-neutral-bg"
            >
              Crear cuenta gratis
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-neutral-bg px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
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
                className="flex flex-col gap-2 rounded-2xl bg-bg-primary p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-h3">{articulo.titulo}</h3>
                <p className="text-small text-text-secondary">
                  {articulo.descripcion}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 lg:gap-5">
          <h2 className="pb-2 text-center font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
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

      {/* Últimas dudas antes de decidirse, justo antes del CTA final — no es
          un FAQ (eso ya está más arriba), son objeciones concretas de
          conversión (¿y si ya uso otra herramienta?, ¿y si lo dejo?, ¿hace
          falta saber de tecnología?). */}
      <section className="border-t border-border px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <h2 className="text-center font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            Antes de dejarlo para luego
          </h2>
          <div className="flex flex-col gap-6">
            {OBJECIONES.map(({ pregunta, respuesta }) => (
              <div key={pregunta} className="flex flex-col gap-1">
                <h3 className="text-h3">{pregunta}</h3>
                <p className="text-small text-text-secondary">{respuesta}</p>
              </div>
            ))}
          </div>
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

        <h2 className="relative font-display text-h1 text-3xl! text-white uppercase font-normal! lg:text-5xl!">
          Empieza a organizar tu contenido hoy
        </h2>
        <div className="relative flex flex-col items-center gap-1.5">
          <Link
            href="/registro"
            className="group animate-cta-brillo flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-body font-medium text-accent shadow-lg active:bg-neutral-bg"
          >
            Crear cuenta gratis
            <ArrowRight
              size={16}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <span className="text-caption text-white/70">
            Gratis, sin tarjeta.
          </span>
        </div>
        {/* Ola en el borde inferior — transición hacia "Invita a otros
            creadores", que baja hasta aquí abajo del todo (a quien todavía
            no se ha registrado no le interesa invitar a nadie, es un
            feature para quien ya es usuario, no un argumento para
            decidirse) y hacia el footer blanco. */}
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

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-bg">
            <Gift size={20} strokeWidth={1.5} className="text-accent" />
          </span>
          <h2 className="font-display text-h1 text-3xl! uppercase font-normal! lg:text-5xl!">
            Invita a otros creadores
          </h2>
          <p className="max-w-xl text-body text-text-secondary">
            En cuanto creas tu cuenta, tienes tu propio enlace para invitar a
            otros creadores a organizarse con Guionia.
          </p>
          <Link
            href="/registro"
            className="group flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-body text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg active:translate-y-0"
          >
            Crear cuenta y conseguir tu enlace
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      <LandingFooter />
      <CtaFlotanteLanding />
      <BotonVolverArriba />
    </div>
  );
}
