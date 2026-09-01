import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { CuentaLoader } from "@/components/CuentaLoader";
import { CuentaSection } from "@/components/CuentaSection";
import { CuentaTiktokSection } from "@/components/CuentaTiktokSection";
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
  const rango: RangoEstadisticas = isRangoEstadisticas(rangoParam) ? rangoParam : "mes";
  const cuenta = cuentaParam === "tiktok" ? "tiktok" : "youtube";

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
      : (conexionTiktok?.display_name ?? "TikTok");
  const avatarUrl =
    cuenta === "youtube" ? conexionYoutube?.canal_thumbnail_url : conexionTiktok?.avatar_url;
  const IconCuenta = PLATAFORMA_ICON[cuenta];
  const tonoCuenta = PLATAFORMA_TONO[cuenta];

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <OndaCadencia porcentaje={0} alturaFija={255} />
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

        <div className="flex flex-col items-center gap-1.5 pt-4 pb-4">
          <span className="animate-escala-entrada relative flex h-20 w-20 shrink-0 items-center justify-center">
            <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-black">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="font-display text-h1 text-white">{nombre[0]?.toUpperCase()}</span>
              )}
            </span>
            <span
              className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: tonoCuenta }}
            >
              <IconCuenta size={11} strokeWidth={1.5} className="text-white" />
            </span>
          </span>
          <span className="text-h2 text-white">{nombre}</span>
          <span className="text-caption text-white/80">
            {cuenta === "youtube" ? "Canal de YouTube" : "Cuenta de TikTok"}
          </span>
        </div>

        <div className="-mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-1 rounded-full bg-bg-primary p-1 shadow-md">
            <Link
              href={`/contenido/cuenta?rango=${rango}&cuenta=youtube`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption ${
                cuenta === "youtube" ? "bg-accent text-white" : "text-text-secondary"
              }`}
            >
              <PLATAFORMA_ICON.youtube size={14} strokeWidth={1.5} />
              {PLATAFORMA_LABEL.youtube}
            </Link>
            <Link
              href={`/contenido/cuenta?rango=${rango}&cuenta=tiktok`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption ${
                cuenta === "tiktok" ? "bg-accent text-white" : "text-text-secondary"
              }`}
            >
              <PLATAFORMA_ICON.tiktok size={14} strokeWidth={1.5} />
              {PLATAFORMA_LABEL.tiktok}
            </Link>
          </div>

          <SelectorRango rango={rango} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2 px-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:px-8">
        <Suspense key={`${cuenta}-${rango}`} fallback={<CuentaLoader />}>
          {cuenta === "youtube" ? <CuentaSection rango={rango} /> : <CuentaTiktokSection rango={rango} />}
        </Suspense>
      </div>
    </div>
  );
}
