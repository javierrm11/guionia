import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clapperboard, Music, Settings } from "lucide-react";
import { CuentaLoader } from "@/components/CuentaLoader";
import { CuentaSection } from "@/components/CuentaSection";
import { CuentaTiktokSection } from "@/components/CuentaTiktokSection";
import { SelectorRango } from "@/components/SelectorRango";
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h1">Cuenta</h1>
        <SelectorRango rango={rango} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/contenido/cuenta?rango=${rango}&cuenta=youtube`}
          className={`flex items-center gap-2.5 rounded-md p-3 ${
            cuenta === "youtube" ? "bg-bg-primary ring-2 ring-accent" : "bg-bg-primary opacity-60"
          }`}
        >
          {conexionYoutube?.canal_thumbnail_url ? (
            <Image
              src={conexionYoutube.canal_thumbnail_url}
              alt=""
              width={36}
              height={36}
              className="shrink-0 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary">
              <Clapperboard size={18} strokeWidth={1.5} className="text-accent" />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-h3">{conexionYoutube?.canal_titulo ?? "YouTube"}</span>
            <span className="text-caption text-text-secondary">
              {conexionYoutube ? "Canal de YouTube" : "No conectado"}
            </span>
          </span>
        </Link>

        <Link
          href={`/contenido/cuenta?rango=${rango}&cuenta=tiktok`}
          className={`flex items-center gap-2.5 rounded-md p-3 ${
            cuenta === "tiktok" ? "bg-bg-primary ring-2 ring-accent" : "bg-bg-primary opacity-60"
          }`}
        >
          {conexionTiktok?.avatar_url ? (
            <Image
              src={conexionTiktok.avatar_url}
              alt=""
              width={36}
              height={36}
              className="shrink-0 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary">
              <Music size={18} strokeWidth={1.5} className="text-accent" />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-h3">{conexionTiktok?.display_name ?? "TikTok"}</span>
            <span className="text-caption text-text-secondary">
              {conexionTiktok ? "Cuenta de TikTok" : "No conectado"}
            </span>
          </span>
        </Link>
      </div>

      <Suspense key={`${cuenta}-${rango}`} fallback={<CuentaLoader />}>
        {cuenta === "youtube" ? <CuentaSection rango={rango} /> : <CuentaTiktokSection rango={rango} />}
      </Suspense>

      <Link
        href="/configuracion"
        className="flex items-center justify-between rounded-md bg-bg-primary p-4"
      >
        <span className="flex items-center gap-2.5 text-body text-text-primary">
          <Settings size={18} strokeWidth={1.5} />
          Ajustes
        </span>
        <ChevronRight size={16} strokeWidth={2} className="text-text-disabled" />
      </Link>
    </div>
  );
}
