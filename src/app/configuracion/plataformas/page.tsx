import Image from "next/image";
import { Clapperboard, Music } from "lucide-react";
import { PlataformasActivasForm } from "@/components/PlataformasActivasForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import {
  desconectarTiktok,
  desconectarYoutube,
  guardarPlataformasActivas,
  sincronizarTiktok,
  sincronizarYoutube,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function PlataformasPage({
  searchParams,
}: {
  searchParams: Promise<{
    youtube_conectado?: string;
    youtube_error?: string;
    youtube_importados?: string;
    tiktok_conectado?: string;
    tiktok_error?: string;
    tiktok_importados?: string;
  }>;
}) {
  const {
    youtube_conectado,
    youtube_error,
    youtube_importados,
    tiktok_conectado,
    tiktok_error,
    tiktok_importados,
  } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("plataformas_activas").select("plataforma");
  const activas = (data ?? []).map((r) => r.plataforma).filter(isPlataforma);

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
    <div className="flex flex-1 flex-col gap-6 p-4">
      <PlataformasActivasForm activas={activas} action={guardarPlataformasActivas} />

      <section className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
        <h2 className="text-h2">Cuentas conectadas</h2>

        {youtube_conectado && (
          <p className="text-small text-success">Cuenta de YouTube conectada.</p>
        )}
        {youtube_error && (
          <p className="text-small text-danger">
            No se pudo conectar con YouTube. Inténtalo de nuevo.
          </p>
        )}
        {youtube_importados != null && (
          <p className="text-small text-success">
            {youtube_importados === "0"
              ? "Ya estaba todo sincronizado — no había vídeos nuevos."
              : `${youtube_importados} vídeo(s) importado(s) desde tu canal.`}
          </p>
        )}
        {tiktok_conectado && (
          <p className="text-small text-success">Cuenta de TikTok conectada.</p>
        )}
        {tiktok_error && (
          <p className="text-small text-danger">
            No se pudo conectar con TikTok. Inténtalo de nuevo.
          </p>
        )}
        {tiktok_importados != null && (
          <p className="text-small text-success">
            {tiktok_importados === "0"
              ? "Ya estaba todo sincronizado — no había vídeos nuevos."
              : `${tiktok_importados} vídeo(s) importado(s) desde tu cuenta.`}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {conexionYoutube?.canal_thumbnail_url ? (
              <Image
                src={conexionYoutube.canal_thumbnail_url}
                alt=""
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-secondary">
                <Clapperboard size={18} strokeWidth={1.5} className="text-accent" />
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-body text-text-primary">YouTube</span>
              <span className="text-caption text-text-secondary">
                {conexionYoutube ? conexionYoutube.canal_titulo : "No conectado"}
              </span>
            </div>
          </div>

          {conexionYoutube ? (
            <div className="flex items-center gap-3">
              <form action={sincronizarYoutube}>
                <button type="submit" className="text-small text-accent">
                  Sincronizar
                </button>
              </form>
              <form action={desconectarYoutube}>
                <ConfirmButton
                  message="¿Desconectar tu cuenta de YouTube?"
                  className="text-small text-accent"
                >
                  Desconectar
                </ConfirmButton>
              </form>
            </div>
          ) : (
            <a
              href="/api/youtube/conectar"
              className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
            >
              Conectar
            </a>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {conexionTiktok?.avatar_url ? (
              <Image
                src={conexionTiktok.avatar_url}
                alt=""
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-secondary">
                <Music size={18} strokeWidth={1.5} className="text-accent" />
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-body text-text-primary">TikTok</span>
              <span className="text-caption text-text-secondary">
                {conexionTiktok ? conexionTiktok.display_name : "No conectado"}
              </span>
            </div>
          </div>

          {conexionTiktok ? (
            <div className="flex items-center gap-3">
              <form action={sincronizarTiktok}>
                <button type="submit" className="text-small text-accent">
                  Sincronizar
                </button>
              </form>
              <form action={desconectarTiktok}>
                <ConfirmButton
                  message="¿Desconectar tu cuenta de TikTok?"
                  className="text-small text-accent"
                >
                  Desconectar
                </ConfirmButton>
              </form>
            </div>
          ) : (
            <a
              href="/api/tiktok/conectar"
              className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
            >
              Conectar
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
