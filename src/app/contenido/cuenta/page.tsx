import { Suspense } from "react";
import Link from "next/link";
import { BarChart3, Settings } from "lucide-react";
import { AvatarCuenta } from "@/components/AvatarCuenta";
import { CuentaLoader } from "@/components/CuentaLoader";
import { CuentaSection } from "@/components/CuentaSection";
import { CuentaTiktokSection } from "@/components/CuentaTiktokSection";
import { CuentaUnificadaSection } from "@/components/CuentaUnificadaSection";
import { SelectorRango } from "@/components/SelectorRango";
import { OndaCadencia } from "@/components/OndaCadencia";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL } from "@/lib/plataformas";
import { PLATAFORMA_TONO } from "@/components/PlataformaTile";
import { createClient } from "@/lib/supabase/server";
import { isRangoEstadisticas, type RangoEstadisticas } from "@/lib/contenido";

export const dynamic = "force-dynamic";

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; cuenta?: string }>;
}) {
  const { rango: rangoParam, cuenta: cuentaParam } = await searchParams;
  const rango: RangoEstadisticas = isRangoEstadisticas(rangoParam)
    ? rangoParam
    : "mes";
  const cuenta =
    cuentaParam === "tiktok"
      ? "tiktok"
      : cuentaParam === "todas"
        ? "todas"
        : "youtube";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conexionYoutube } = user
    ? await supabase
        .from("youtube_conexiones")
        .select("canal_titulo, canal_thumbnail_url")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: conexionTiktok } = user
    ? await supabase
        .from("tiktok_conexiones")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const nombre =
    cuenta === "youtube"
      ? (conexionYoutube?.canal_titulo ?? "YouTube")
      : cuenta === "tiktok"
        ? (conexionTiktok?.display_name ?? "TikTok")
        : "Todas las plataformas";
  const avatarUrl =
    cuenta === "youtube"
      ? conexionYoutube?.canal_thumbnail_url
      : cuenta === "tiktok"
        ? conexionTiktok?.avatar_url
        : null;
  const IconCuenta = cuenta === "todas" ? BarChart3 : PLATAFORMA_ICON[cuenta];
  const tonoCuenta =
    cuenta === "todas" ? "var(--accent)" : PLATAFORMA_TONO[cuenta];

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <OndaCadencia porcentaje={0} alturaFija={255} color="var(--accent)" />
      </div>

      <div className="relative z-10 flex flex-col p-4 pt-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-h1 text-white">Cuenta</h1>
          <Link
            href="/configuracion"
            aria-label="Ajustes"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85"
          >
            <Settings size={20} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-1.5 pt-4 pb-4 lg:gap-2">
          <span className="animate-escala-entrada relative flex h-20 w-20 shrink-0 items-center justify-center lg:h-24 lg:w-24">
            <span
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full lg:h-24 lg:w-24"
              style={{
                backgroundColor: cuenta === "todas" ? tonoCuenta : "#000",
              }}
            >
              {cuenta === "todas" ? (
                <IconCuenta
                  size={32}
                  strokeWidth={1.5}
                  className="text-white"
                />
              ) : (
                <AvatarCuenta src={avatarUrl ?? null} nombre={nombre} />
              )}
            </span>
            {cuenta !== "todas" && (
              <span
                className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full lg:h-7 lg:w-7"
                style={{ backgroundColor: tonoCuenta }}
              >
                <IconCuenta
                  size={11}
                  strokeWidth={1.5}
                  className="text-white lg:h-3.5 lg:w-3.5"
                />
              </span>
            )}
          </span>
          <span className="text-h2 text-white lg:text-h1">{nombre}</span>
          <span className="text-caption text-white/80 lg:text-body">
            {cuenta === "youtube"
              ? "Canal de YouTube"
              : cuenta === "tiktok"
                ? "Cuenta de TikTok"
                : "YouTube + TikTok combinados"}
          </span>
        </div>

        <div className="-mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-1 rounded-full bg-bg-primary p-1 shadow-md lg:p-1.5">
            <Link
              href={`/contenido/cuenta?rango=${rango}&cuenta=todas`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption lg:px-4 lg:py-2 lg:text-body ${
                cuenta === "todas"
                  ? "bg-accent text-white"
                  : "text-text-secondary"
              }`}
            >
              <BarChart3 size={14} strokeWidth={1.5} />
              Todas
            </Link>
            <Link
              href={`/contenido/cuenta?rango=${rango}&cuenta=youtube`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption lg:px-4 lg:py-2 lg:text-body ${
                cuenta === "youtube"
                  ? "bg-accent text-white"
                  : "text-text-secondary"
              }`}
            >
              <PLATAFORMA_ICON.youtube size={14} strokeWidth={1.5} />
              {PLATAFORMA_LABEL.youtube}
            </Link>
            <Link
              href={`/contenido/cuenta?rango=${rango}&cuenta=tiktok`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption lg:px-4 lg:py-2 lg:text-body ${
                cuenta === "tiktok"
                  ? "bg-accent text-white"
                  : "text-text-secondary"
              }`}
            >
              <PLATAFORMA_ICON.tiktok size={14} strokeWidth={1.5} />
              {PLATAFORMA_LABEL.tiktok}
            </Link>
          </div>

          <SelectorRango rango={rango} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2 px-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:gap-3 lg:px-8">
        <Suspense key={`${cuenta}-${rango}`} fallback={<CuentaLoader />}>
          {cuenta === "youtube" ? (
            <CuentaSection rango={rango} />
          ) : cuenta === "tiktok" ? (
            <CuentaTiktokSection rango={rango} />
          ) : (
            <CuentaUnificadaSection rango={rango} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
