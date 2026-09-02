import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CopiarGuionButton } from "@/components/CopiarGuionButton";
import { EstadisticasTiktokVideo } from "@/components/EstadisticasTiktokVideo";
import { EstadisticasVideoLoader } from "@/components/EstadisticasVideoLoader";
import { EstadisticasYoutubeVideo } from "@/components/EstadisticasYoutubeVideo";
import { GuionEscenas } from "@/components/GuionEscenas";
import { RetencionSection } from "@/components/RetencionSection";
import { RetencionLoader } from "@/components/RetencionLoader";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { obtenerAccessTokenValido as obtenerAccessTokenValidoYoutube } from "@/lib/youtube/conexion";
import { extraerVideoId as extraerVideoIdYoutube } from "@/lib/youtube/oauth";
import { extraerVideoId as extraerVideoIdTiktok } from "@/lib/tiktok/oauth";
import { ESTADO_PIEZA_LABEL, ESTADO_PIEZA_TONE, getSiguienteEstadoVideo } from "@/lib/contenido";
import {
  agregarEscenaGuion,
  avanzarEstado,
  eliminarEscenaGuion,
  guardarTextoEscena,
  guardarUrlPublicado,
  moverEscenaGuion,
  restaurarVersionEscena,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function GuionPage({
  params,
}: {
  params: Promise<{ plataforma: string; anio: string; mes: string; dia: string; id: string }>;
}) {
  const { plataforma, anio, mes, dia, id } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const supabase = await createClient();

  const { data: guion } = await supabase
    .from("piezas_contenido")
    .select("*")
    .eq("id", id)
    .eq("plataforma", plataforma)
    .maybeSingle();

  if (!guion) notFound();

  const { data: escenas } = await supabase
    .from("escenas_guion")
    .select("*")
    .eq("pieza_id", id)
    .is("deleted_at", null)
    .order("orden");

  const escenaIds = (escenas ?? []).map((e) => e.id);
  const { data: versiones } =
    escenaIds.length > 0
      ? await supabase
          .from("escena_versiones")
          .select("*")
          .in("escena_id", escenaIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const versionesPorEscena = new Map<
    string,
    { id: string; texto: string; created_at: string }[]
  >();
  for (const v of versiones ?? []) {
    const lista = versionesPorEscena.get(v.escena_id) ?? [];
    lista.push(v);
    versionesPorEscena.set(v.escena_id, lista);
  }

  const siguiente = getSiguienteEstadoVideo(guion.estado);
  const rutaActual = `/contenido/${plataforma}/videos/${anio}/${mes}/${dia}/${guion.id}`;

  // La llamada a la Data API (vistas/likes/comentarios) y la de retención van
  // en componentes async aparte, streamed vía <Suspense> — no deben bloquear
  // el resto de la página, que ya está disponible al instante desde la BD.
  let youtubeVideoId: string | null = null;
  let youtubeAccessToken: string | null = null;
  if (plataforma === "youtube" && guion.estado === "publicado" && guion.url_publicado) {
    const videoId = guion.youtube_video_id ?? extraerVideoIdYoutube(guion.url_publicado);
    if (videoId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const accessToken = user ? await obtenerAccessTokenValidoYoutube(supabase, user.id) : null;
      if (accessToken) {
        youtubeVideoId = videoId;
        youtubeAccessToken = accessToken;
      }
    }
  }

  let tiktokVideoId: string | null = null;
  if (plataforma === "tiktok" && guion.estado === "publicado" && guion.url_publicado) {
    tiktokVideoId = guion.tiktok_video_id ?? extraerVideoIdTiktok(guion.url_publicado);
  }

  const textoCompleto =
    escenas && escenas.length > 0
      ? escenas
          .map((e) => e.texto?.trim())
          .filter((t): t is string => Boolean(t))
          .join("\n\n")
      : (guion.texto ?? "");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:gap-5 lg:p-8">
      {escenas && escenas.length > 0 ? (
        <GuionEscenas
          piezaId={id}
          titulo={guion.titulo}
          numero={guion.numero}
          estadoTone={ESTADO_PIEZA_TONE[guion.estado]}
          estadoLabel={ESTADO_PIEZA_LABEL[guion.estado]}
          fechaPublicacion={guion.fecha_publicacion}
          escenas={escenas}
          versionesPorEscena={Object.fromEntries(versionesPorEscena)}
          rutaActual={rutaActual}
          plataforma={plataforma}
          pilar={guion.pilar}
          moverEscenaGuion={moverEscenaGuion}
          eliminarEscenaGuion={eliminarEscenaGuion}
          guardarTextoEscena={guardarTextoEscena}
          restaurarVersionEscena={restaurarVersionEscena}
          agregarEscenaGuion={agregarEscenaGuion}
        />
      ) : (
        <>
          <p className="text-h2 lg:text-h1">{guion.titulo}</p>

          <div className="flex items-center gap-2">
            {guion.numero != null && (
              <span className="text-small text-text-secondary">#{guion.numero}</span>
            )}
            <Badge tone={ESTADO_PIEZA_TONE[guion.estado]}>{ESTADO_PIEZA_LABEL[guion.estado]}</Badge>
            <span className="text-small text-text-secondary">{guion.fecha_publicacion}</span>
          </div>

          {textoCompleto && <CopiarGuionButton texto={textoCompleto} />}

          {guion.texto && (
            <p className="text-body whitespace-pre-wrap rounded-md border border-border p-4 lg:text-h3 lg:p-5">
              {guion.texto}
            </p>
          )}
        </>
      )}

      {(guion.descripcion_publicacion ||
        guion.titulo_publicacion ||
        guion.etiquetas_publicacion ||
        guion.estado === "publicado") && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-4 lg:gap-3 lg:p-5">
          <h2 className="text-h2 lg:text-h1">Datos de publicación</h2>
          {guion.titulo_publicacion && (
            <div className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Título</span>
              <p className="text-body">{guion.titulo_publicacion}</p>
            </div>
          )}
          {guion.descripcion_publicacion && (
            <div className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Descripción</span>
              <p className="text-body whitespace-pre-wrap">{guion.descripcion_publicacion}</p>
            </div>
          )}
          {guion.etiquetas_publicacion && (
            <div className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Etiquetas</span>
              <p className="text-body">{guion.etiquetas_publicacion}</p>
            </div>
          )}

          {guion.estado === "publicado" && (
            <form action={guardarUrlPublicado} className="flex flex-col gap-1">
              <input type="hidden" name="id" value={guion.id} />
              <input type="hidden" name="redirectTo" value={rutaActual} />
              <span className="text-h3 text-text-secondary">URL del vídeo publicado</span>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="url_publicado"
                  defaultValue={guion.url_publicado ?? ""}
                  placeholder="https://…"
                  className="flex-1 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-sm bg-bg-secondary px-3 py-2 text-small text-text-primary active:bg-border"
                >
                  Guardar
                </button>
              </div>
              {guion.url_publicado && (
                <a
                  href={guion.url_publicado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-small text-accent hover:underline"
                >
                  Abrir vídeo ↗
                </a>
              )}
            </form>
          )}
        </div>
      )}

      {youtubeVideoId && youtubeAccessToken && (
        <Suspense fallback={<EstadisticasVideoLoader titulo="Estadísticas de YouTube" />}>
          <EstadisticasYoutubeVideo videoId={youtubeVideoId} accessToken={youtubeAccessToken} />
        </Suspense>
      )}

      {youtubeVideoId && youtubeAccessToken && (
        <Suspense fallback={<RetencionLoader />}>
          <RetencionSection videoId={youtubeVideoId} accessToken={youtubeAccessToken} />
        </Suspense>
      )}

      {tiktokVideoId && (
        <Suspense fallback={<EstadisticasVideoLoader titulo="Estadísticas de TikTok" />}>
          <EstadisticasTiktokVideo videoId={tiktokVideoId} />
        </Suspense>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {textoCompleto && <CopiarGuionButton texto={textoCompleto} />}

        {siguiente &&
          (siguiente === "publicado" && plataforma !== "linkedin" ? (
            <Link
              href={`${rutaActual}/publicar`}
              className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover lg:px-5 lg:py-2.5"
            >
              Preparar publicación
            </Link>
          ) : (
            <form action={avanzarEstado}>
              <input type="hidden" name="id" value={guion.id} />
              <input type="hidden" name="plataforma" value={plataforma} />
              <input type="hidden" name="siguiente" value={siguiente} />
              <input type="hidden" name="redirectTo" value={rutaActual} />
              <SubmitButton
                pendingLabel="Guardando…"
                className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60 lg:px-5 lg:py-2.5"
              >
                Marcar como {ESTADO_PIEZA_LABEL[siguiente].toLowerCase()}
              </SubmitButton>
            </form>
          ))}
      </div>
    </div>
  );
}
