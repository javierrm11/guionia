import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/Badge";
import { CopiarGuionButton } from "@/components/CopiarGuionButton";
import { SerieSection } from "@/components/SerieSection";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EscenaTextoEditor } from "@/components/EscenaTextoEditor";
import { RetencionSection } from "@/components/RetencionSection";
import { RetencionLoader } from "@/components/RetencionLoader";
import { SubmitButton } from "@/components/SubmitButton";
import { Eye, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isPlataforma } from "@/lib/plataformas";
import { obtenerAccessTokenValido as obtenerAccessTokenValidoYoutube } from "@/lib/youtube/conexion";
import {
  extraerVideoId as extraerVideoIdYoutube,
  obtenerEstadisticasVideos as obtenerEstadisticasVideosYoutube,
} from "@/lib/youtube/oauth";
import { obtenerAccessTokenValido as obtenerAccessTokenValidoTiktok } from "@/lib/tiktok/conexion";
import {
  extraerVideoId as extraerVideoIdTiktok,
  obtenerEstadisticasVideos as obtenerEstadisticasVideosTiktok,
} from "@/lib/tiktok/oauth";
import {
  ESTADO_PIEZA_LABEL,
  ESTADO_PIEZA_TONE,
  TIPOS_ESCENA,
  TIPO_ESCENA_LABEL,
  type TipoEscena,
  getSiguienteEstadoVideo,
} from "@/lib/contenido";
import {
  agregarEscenaGuion,
  avanzarEstado,
  eliminarEscenaGuion,
  guardarTextoEscena,
  guardarUrlPublicado,
  moverEscenaGuion,
  restaurarVersionEscena,
} from "./actions";
import { guardarEtiquetas } from "../../../../../../_shared/etiquetasActions";

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

  let estadisticasYoutube: { vistas: number; likes: number; comentarios: number } | null = null;
  let estadisticasYoutubeError = false;
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
        try {
          const stats = await obtenerEstadisticasVideosYoutube([videoId], accessToken);
          estadisticasYoutube = stats[videoId] ?? null;
        } catch {
          estadisticasYoutubeError = true;
        }
      }
    }
  }

  let estadisticasTiktok: {
    vistas: number;
    likes: number;
    comentarios: number;
    compartidos: number;
  } | null = null;
  let estadisticasTiktokError = false;
  if (plataforma === "tiktok" && guion.estado === "publicado" && guion.url_publicado) {
    const videoId = guion.tiktok_video_id ?? extraerVideoIdTiktok(guion.url_publicado);
    if (videoId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const accessToken = user ? await obtenerAccessTokenValidoTiktok(supabase, user.id) : null;
      if (accessToken) {
        try {
          const stats = await obtenerEstadisticasVideosTiktok([videoId], accessToken);
          estadisticasTiktok = stats[videoId] ?? null;
        } catch {
          estadisticasTiktokError = true;
        }
      }
    }
  }

  const textoCompleto =
    escenas && escenas.length > 0
      ? escenas
          .map((e) => e.texto?.trim())
          .filter((t): t is string => Boolean(t))
          .join("\n\n")
      : (guion.texto ?? "");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <p className="text-h2">{guion.titulo}</p>

      <div className="flex items-center gap-2">
        {guion.numero != null && (
          <span className="text-small text-text-secondary">#{guion.numero}</span>
        )}
        <Badge tone={ESTADO_PIEZA_TONE[guion.estado]}>{ESTADO_PIEZA_LABEL[guion.estado]}</Badge>
        <span className="text-small text-text-secondary">{guion.fecha_publicacion}</span>
      </div>

      {textoCompleto && <CopiarGuionButton texto={textoCompleto} />}

      <form action={guardarEtiquetas} className="flex flex-col gap-1">
        <input type="hidden" name="id" value={guion.id} />
        <input type="hidden" name="redirectTo" value={rutaActual} />
        <span className="text-h3 text-text-secondary">Etiquetas</span>
        <div className="flex gap-2">
          <input
            type="text"
            name="etiquetas"
            defaultValue={guion.etiquetas ?? ""}
            placeholder="separadas por comas"
            className="flex-1 rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm border border-border px-3 py-2 text-small text-text-primary active:bg-bg-secondary"
          >
            Guardar
          </button>
        </div>
      </form>

      <SerieSection
        piezaId={guion.id}
        plataforma={plataforma}
        serie={guion.serie}
        serieParte={guion.serie_parte}
        rutaActual={rutaActual}
      />

      {escenas && escenas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {escenas.map((escena, index) => (
            <div key={escena.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <form action={moverEscenaGuion}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="pieza_id" value={id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <input type="hidden" name="redirectTo" value={rutaActual} />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Mover escena arriba"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowUp size={14} strokeWidth={1.5} />
                    </button>
                  </form>
                  <form action={moverEscenaGuion}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="pieza_id" value={id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <input type="hidden" name="redirectTo" value={rutaActual} />
                    <button
                      type="submit"
                      disabled={index === escenas.length - 1}
                      aria-label="Mover escena abajo"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowDown size={14} strokeWidth={1.5} />
                    </button>
                  </form>
                </div>

                <span className="text-h3">
                  {TIPO_ESCENA_LABEL[escena.tipo_escena as TipoEscena]}
                  {escena.duracion_segundos ? ` · ${escena.duracion_segundos}s` : ""}
                </span>

                <form action={eliminarEscenaGuion} className="ml-auto">
                  <input type="hidden" name="id" value={escena.id} />
                  <input type="hidden" name="redirectTo" value={rutaActual} />
                  <ConfirmButton message="¿Eliminar esta escena?" className="p-2 -m-2 text-small text-accent">
                    Eliminar
                  </ConfirmButton>
                </form>
              </div>

              <EscenaTextoEditor
                escenaId={escena.id}
                redirectTo={rutaActual}
                textoInicial={escena.texto ?? ""}
                tipoEscena={escena.tipo_escena as TipoEscena}
                duracionSegundos={escena.duracion_segundos}
                plataforma={plataforma}
                tituloIdea={guion.titulo}
                pilar={guion.pilar}
                otrasEscenas={(escenas ?? [])
                  .filter((e) => e.id !== escena.id)
                  .map((e) => ({
                    tipoEscena: e.tipo_escena as TipoEscena,
                    texto: e.texto ?? "",
                  }))}
                guardarAction={guardarTextoEscena}
              />

              {(versionesPorEscena.get(escena.id) ?? []).length > 0 && (
                <details className="text-small">
                  <summary className="cursor-pointer text-text-secondary">
                    {versionesPorEscena.get(escena.id)!.length} versión(es) anterior(es)
                  </summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {versionesPorEscena.get(escena.id)!.map((v) => (
                      <li
                        key={v.id}
                        className="flex flex-col gap-1 rounded-sm border border-border p-2"
                      >
                        <span className="text-caption text-text-disabled">
                          {new Date(v.created_at).toLocaleString("es-ES")}
                        </span>
                        <p className="whitespace-pre-wrap text-text-secondary">{v.texto}</p>
                        <form action={restaurarVersionEscena} className="self-start">
                          <input type="hidden" name="escena_id" value={escena.id} />
                          <input type="hidden" name="version_id" value={v.id} />
                          <input type="hidden" name="redirectTo" value={rutaActual} />
                          <button type="submit" className="text-caption text-accent">
                            Restaurar esta versión
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}

          <form
            action={agregarEscenaGuion}
            className="flex flex-col gap-3 rounded-md border border-border p-3"
          >
            <input type="hidden" name="pieza_id" value={id} />
            <input type="hidden" name="redirectTo" value={rutaActual} />

            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">
                Tipo<span className="text-accent"> *</span>
              </span>
              <select
                name="tipo_escena"
                required
                defaultValue=""
                className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              >
                <option value="" disabled>
                  Selecciona un tipo
                </option>
                {TIPOS_ESCENA.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_ESCENA_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Duración (segundos, opcional)</span>
              <input
                type="number"
                name="duracion_segundos"
                min={1}
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </label>

            <SubmitButton
              pendingLabel="Añadiendo…"
              className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
            >
              + Añadir escena
            </SubmitButton>
          </form>
        </div>
      ) : (
        guion.texto && (
          <p className="text-body whitespace-pre-wrap rounded-md border border-border bg-bg-primary p-4">
            {guion.texto}
          </p>
        )
      )}

      {(guion.descripcion_publicacion ||
        guion.titulo_publicacion ||
        guion.etiquetas_publicacion ||
        guion.estado === "publicado") && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <h2 className="text-h2">Datos de publicación</h2>
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
                  className="rounded-sm border border-border px-3 py-2 text-small text-text-primary active:bg-bg-secondary"
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

      {estadisticasYoutubeError && (
        <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
          <h2 className="text-h2">Estadísticas de YouTube</h2>
          <p className="text-small text-danger">
            No se pudieron cargar las estadísticas ahora mismo. Inténtalo de nuevo más tarde.
          </p>
        </div>
      )}

      {estadisticasYoutube && (
        <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
          <h2 className="text-h2">Estadísticas de YouTube</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <Eye size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">{estadisticasYoutube.vistas.toLocaleString("es-ES")}</span>
              <span className="text-caption text-text-secondary">vistas</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ThumbsUp size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">{estadisticasYoutube.likes.toLocaleString("es-ES")}</span>
              <span className="text-caption text-text-secondary">likes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">
                {estadisticasYoutube.comentarios.toLocaleString("es-ES")}
              </span>
              <span className="text-caption text-text-secondary">comentarios</span>
            </div>
          </div>
        </div>
      )}

      {youtubeVideoId && youtubeAccessToken && (
        <Suspense fallback={<RetencionLoader />}>
          <RetencionSection videoId={youtubeVideoId} accessToken={youtubeAccessToken} />
        </Suspense>
      )}

      {estadisticasTiktokError && (
        <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
          <h2 className="text-h2">Estadísticas de TikTok</h2>
          <p className="text-small text-danger">
            No se pudieron cargar las estadísticas ahora mismo. Inténtalo de nuevo más tarde.
          </p>
        </div>
      )}

      {estadisticasTiktok && (
        <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
          <h2 className="text-h2">Estadísticas de TikTok</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-1">
              <Eye size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">{estadisticasTiktok.vistas.toLocaleString("es-ES")}</span>
              <span className="text-caption text-text-secondary">vistas</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ThumbsUp size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">{estadisticasTiktok.likes.toLocaleString("es-ES")}</span>
              <span className="text-caption text-text-secondary">likes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">
                {estadisticasTiktok.comentarios.toLocaleString("es-ES")}
              </span>
              <span className="text-caption text-text-secondary">comentarios</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Share2 size={18} strokeWidth={1.5} className="text-accent" />
              <span className="text-h3">
                {estadisticasTiktok.compartidos.toLocaleString("es-ES")}
              </span>
              <span className="text-caption text-text-secondary">compartidos</span>
            </div>
          </div>
        </div>
      )}

      {siguiente &&
        (siguiente === "publicado" && plataforma !== "linkedin" ? (
          <Link
            href={`${rutaActual}/publicar`}
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
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
              className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
            >
              Marcar como {ESTADO_PIEZA_LABEL[siguiente].toLowerCase()}
            </SubmitButton>
          </form>
        ))}
    </div>
  );
}
