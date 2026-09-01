import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Camera,
  FileText,
  Flame,
  Lightbulb,
  Search,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { FaqItem } from "@/components/FaqItem";
import { LandingHeader } from "@/components/LandingHeader";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { PLATAFORMA_ICON } from "@/lib/plataformas";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guionia — Organiza y publica tu contenido de YouTube y TikTok",
  description:
    "Guionia centraliza tus ideas, guiones y calendario de publicación para YouTube y TikTok. Define tu cadencia semanal, escribe con estructura y sube tus vídeos sin salir de la app. Gratis.",
  openGraph: {
    title: "Guionia — Organiza y publica tu contenido de YouTube y TikTok",
    description:
      "Ideas, guiones y calendario de publicación en un solo sitio, para creadores que publican en YouTube y TikTok.",
  },
};

const PASOS = [
  {
    icon: Lightbulb,
    titulo: "Apunta la idea al momento",
    texto: "Captura rápida desde cualquier pantalla, antes de que se te olvide.",
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
    texto: "Marca cuántas veces publicas y qué días — Guionia te dice qué toca hoy.",
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
    texto: "Reutiliza tus hooks y CTAs favoritos en vez de partir de cero cada vez.",
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
    respuesta: "Sí, por ahora Guionia es gratis — sin límites ocultos ni tarjeta de crédito.",
  },
  {
    pregunta: "¿Qué plataformas soporta?",
    respuesta:
      "Hoy conecta con YouTube y TikTok: puedes subir vídeos y programar publicaciones directo desde Guionia.",
  },
  {
    pregunta: "¿Necesito instalar algo?",
    respuesta: "No. Guionia funciona en el navegador, tanto en el móvil como en el escritorio.",
  },
  {
    pregunta: "¿Está pensado para un equipo o para una persona sola?",
    respuesta:
      "Para creadores independientes que gestionan su propio contenido de principio a fin.",
  },
  {
    pregunta: "¿Mis ideas y guiones están seguros?",
    respuesta: "Se guardan en tu cuenta, protegidos por login, y puedes borrarlos cuando quieras.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/contenido");

  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />

      <section className="flex flex-col items-center gap-6 px-4 pt-8 pb-12 text-center lg:mx-auto lg:w-full lg:max-w-3xl lg:px-8 lg:pt-16">
        <span className="animate-tarjeta-entrada inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-3 py-1 text-caption text-accent">
          Para creadores de YouTube y TikTok
        </span>
        <h1
          className="animate-tarjeta-entrada font-display text-3xl leading-tight font-semibold text-text-primary lg:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          Deja de perder ideas de vídeo entre notas sueltas
        </h1>
        <p
          className="animate-tarjeta-entrada max-w-xl text-body text-text-secondary lg:text-h3"
          style={{ animationDelay: "160ms" }}
        >
          Guionia centraliza tus ideas, guiones y calendario de publicación para YouTube y
          TikTok — para que sepas siempre qué toca grabar hoy.
        </p>
        <div
          className="animate-tarjeta-entrada flex flex-col items-center gap-1.5"
          style={{ animationDelay: "220ms" }}
        >
          <Link
            href="/registro"
            className="animate-cta-brillo rounded-sm bg-accent px-6 py-3 text-body text-white active:bg-accent-hover"
          >
            Crear cuenta gratis
          </Link>
          <span className="text-caption text-text-disabled">Gratis, sin tarjeta.</span>
          <span className="text-caption text-text-disabled">
            Construido por un creador, para creadores.
          </span>
        </div>
      </section>

      {/* Mockup ilustrativo del dashboard "Control" — datos de ejemplo, no en vivo. */}
      <section className="px-4 pb-16 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-8">
        <div
          className="overflow-hidden rounded-md border border-border"
          style={{ boxShadow: "var(--card-shadow), 0 24px 48px rgba(16,24,40,0.08)" }}
        >
          <div className="flex items-center gap-2 border-b border-border bg-neutral-bg px-4 py-2.5">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-bg-page px-3 py-1.5">
              <Search size={13} strokeWidth={1.5} className="shrink-0 text-text-disabled" />
              <span className="text-caption text-text-disabled">
                Buscar por título o etiqueta…
              </span>
            </div>
            <TrendingUp size={16} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold text-white"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)",
                boxShadow: "0 4px 12px rgba(232,57,59,0.35)",
              }}
            >
              <Flame size={12} strokeWidth={0} fill="#FFFFFF" />6 semanas seguidas
            </span>

            <div className="flex flex-col gap-1.5">
              <span className="text-caption text-text-secondary">Cadencia semanal</span>
              <div className="h-1.5 w-full rounded-full bg-neutral-bg">
                <div className="h-1.5 w-3/4 rounded-full bg-accent" />
              </div>
              <span className="text-caption text-text-disabled">3 de 4 esta semana</span>
            </div>

            <div className="flex items-center gap-3.5 rounded-md bg-bg-primary p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-danger">
                <PLATAFORMA_ICON.youtube size={20} strokeWidth={1.5} className="text-white" />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <span className="text-caption font-semibold text-accent">Toca grabar</span>
                <p className="truncate text-h2">5 hábitos que cambiaron mi rutina</p>
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
                    style={{ backgroundColor: PLATAFORMA_TONO[t.plataforma] }}
                  >
                    <PLATAFORMA_ICON.tiktok size={16} strokeWidth={1.5} className="text-white" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-left">{t.titulo}</span>
                  <Badge tone={t.tone}>{t.label}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-6 border-t border-border bg-neutral-bg px-4 py-12 lg:px-8">
        <span className="text-caption text-text-secondary">Conecta tus cuentas</span>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-sm"
              style={{ backgroundColor: PLATAFORMA_TONO.youtube }}
            >
              <PLATAFORMA_ICON.youtube size={22} strokeWidth={1.5} className="text-white" />
            </span>
            <span className="text-caption text-text-secondary">YouTube</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-sm"
              style={{ backgroundColor: PLATAFORMA_TONO.tiktok }}
            >
              <PLATAFORMA_ICON.tiktok size={22} strokeWidth={1.5} className="text-white" />
            </span>
            <span className="text-caption text-text-secondary">TikTok</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-neutral">
              <Camera size={22} strokeWidth={1.5} className="text-white" />
            </span>
            <span className="text-caption text-text-disabled">Próximamente</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10 border-t border-border px-4 py-14 lg:mx-auto lg:w-full lg:max-w-4xl lg:px-8">
        <h2 className="text-center text-h1">Cómo funciona</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(({ icon: Icon, titulo, texto, extra }, i) => (
            <div key={titulo} className="relative flex flex-col items-center gap-3 text-center">
              {i < PASOS.length - 1 && (
                <span className="absolute top-5 left-[calc(50%+26px)] hidden h-px w-[calc(100%-52px)] bg-border lg:block" />
              )}
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 -left-2 font-display text-2xl text-accent-bg select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon size={20} strokeWidth={1.5} className="relative text-white" />
              </span>
              <span className="text-h3">{titulo}</span>
              <p className="text-small text-text-secondary">{texto}</p>
              {extra}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-1 border-t border-border bg-neutral-bg px-4 py-14 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-8">
        <h2 className="pb-3 text-center text-h1">Preguntas frecuentes</h2>
        {FAQS.map((f) => (
          <FaqItem key={f.pregunta} pregunta={f.pregunta} respuesta={f.respuesta} />
        ))}
      </section>

      <section className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <OndaCadencia porcentaje={100} alturaFija={220} />
        </div>
        <h2 className="text-h1 text-white">Empieza a organizar tu contenido hoy</h2>
        <Link
          href="/registro"
          className="rounded-sm bg-white px-6 py-3 text-body text-accent active:bg-neutral-bg"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="flex flex-col items-center gap-3 border-t border-border px-4 py-8 text-center lg:flex-row lg:justify-between lg:px-8">
        <span className="flex items-center gap-2 text-caption text-text-disabled">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image src="/logo/logo.jpg" alt="" fill className="object-cover" />
          </span>
          © {new Date().getFullYear()} Guionia
        </span>
        <nav className="flex items-center gap-4">
          <Link href="/legal/privacidad" className="text-caption text-text-secondary">
            Privacidad
          </Link>
          <Link href="/legal/terminos" className="text-caption text-text-secondary">
            Términos
          </Link>
          <Link href="/login" className="text-caption text-text-secondary">
            Iniciar sesión
          </Link>
        </nav>
      </footer>
    </div>
  );
}
