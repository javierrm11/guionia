import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Music, Settings } from "lucide-react";
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
        <Link
          href="/configuracion"
          aria-label="Ajustes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-bg-primary"
        >
          <Settings size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/contenido/cuenta?rango=${rango}&cuenta=youtube`}
          className={`flex items-center gap-2.5 rounded-md border border-border p-3 ${
            cuenta === "youtube" ? "ring-2 ring-accent" : "opacity-60"
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
          className={`flex items-center gap-2.5 rounded-md border border-border p-3 ${
            cuenta === "tiktok" ? "ring-2 ring-accent" : "opacity-60"
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

      <div className="flex flex-col gap-2">
        <SelectorRango rango={rango} />

        <Suspense key={`${cuenta}-${rango}`} fallback={<CuentaLoader />}>
          {cuenta === "youtube" ? <CuentaSection rango={rango} /> : <CuentaTiktokSection rango={rango} />}
        </Suspense>
      </div>
    </div>
  );
}
