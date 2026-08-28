import Image from "next/image";
import { Briefcase, Camera, Clapperboard, Music } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { desconectarTiktok, desconectarYoutube, sincronizarTiktok, sincronizarYoutube } from "./actions";

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
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-8">
      <h1 className="text-h1">Cuentas conectadas</h1>

      <section className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
        {youtube_conectado && (
          <p className="text-small text-success">Cuenta de YouTube conectada.</p>
        )}
        {youtube_error && !conexionYoutube && (
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
        {tiktok_error && !conexionTiktok && (
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
              <span className={`text-caption ${youtube_error && conexionYoutube ? "text-danger" : "text-text-secondary"}`}>
                {conexionYoutube
                  ? youtube_error
                    ? "Conexión caducada"
                    : conexionYoutube.canal_titulo
                  : "No conectado"}
              </span>
            </div>
          </div>

          {conexionYoutube ? (
            youtube_error ? (
              <a
                href="/api/youtube/conectar"
                className="p-2 -m-2 text-small text-accent"
              >
                Reconectar
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <form action={sincronizarYoutube}>
                  <SubmitButton pendingLabel="Sincronizando…" className="p-2 -m-2 text-small text-accent">
                    Sincronizar
                  </SubmitButton>
                </form>
                <form action={desconectarYoutube}>
                  <ConfirmButton
                    message="¿Desconectar tu cuenta de YouTube?"
                    pendingLabel="Desconectando…"
                    className="p-2 -m-2 text-small text-accent"
                  >
                    Desconectar
                  </ConfirmButton>
                </form>
              </div>
            )
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
              <span className={`text-caption ${tiktok_error && conexionTiktok ? "text-danger" : "text-text-secondary"}`}>
                {conexionTiktok
                  ? tiktok_error
                    ? "Conexión caducada"
                    : conexionTiktok.display_name
                  : "No conectado"}
              </span>
            </div>
          </div>

          {conexionTiktok ? (
            tiktok_error ? (
              <a
                href="/api/tiktok/conectar"
                className="p-2 -m-2 text-small text-accent"
              >
                Reconectar
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <form action={sincronizarTiktok}>
                  <SubmitButton pendingLabel="Sincronizando…" className="p-2 -m-2 text-small text-accent">
                    Sincronizar
                  </SubmitButton>
                </form>
                <form action={desconectarTiktok}>
                  <ConfirmButton
                    message="¿Desconectar tu cuenta de TikTok?"
                    pendingLabel="Desconectando…"
                    className="p-2 -m-2 text-small text-accent"
                  >
                    Desconectar
                  </ConfirmButton>
                </form>
              </div>
            )
          ) : (
            <a
              href="/api/tiktok/conectar"
              className="rounded-sm bg-accent px-3 py-1.5 text-small text-white active:bg-accent-hover"
            >
              Conectar
            </a>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-secondary">
              <Camera size={18} strokeWidth={1.5} className="text-accent" />
            </span>
            <div className="flex flex-col">
              <span className="text-body text-text-primary">Instagram</span>
              <span className="text-caption text-text-secondary">Próximamente</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-secondary">
              <Briefcase size={18} strokeWidth={1.5} className="text-accent" />
            </span>
            <div className="flex flex-col">
              <span className="text-body text-text-primary">LinkedIn</span>
              <span className="text-caption text-text-secondary">Próximamente</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
